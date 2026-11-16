"""
Galois correspondence lattice.

For an irreducible f over Q with splitting field L and G = Gal(L/Q), computes
every subgroup H <= G together with its fixed field L^H, and the covering
relations of the subgroup lattice. By the fundamental theorem of Galois theory
the subfield lattice is the same graph with the order reversed:

    H1 <= H2   <=>   L^H1 >= L^H2,      [L^H : Q] = [G : H]

Each node also gets a best-effort human-readable LaTeX label for its fixed
field (Q(sqrt d), Q(zeta_n), Q(c^(1/n)), compositums of those, Q(alpha), ...).
"""

import re
from sage.all import (  # type: ignore
    QQ, ZZ, NumberField, PolynomialRing, cyclotomic_polynomial, euler_phi, latex, libgap, pari,
)

# Above these limits the lattice is both slow to compute (fixed fields of a
# degree-48+ closure) and too dense to draw legibly.
MAX_GROUP_ORDER = 48
MAX_SUBGROUPS = 40

from roots import canonical_roots, describe_roots  # noqa: E402

_R = PolynomialRing(QQ, "x")


def _polredabs(poly):
    return _R(pari(poly).polredabs())


def group_latex(desc):
    """Turn a GAP StructureDescription ('(C3 x C3) : C2', 'SL(2,3)') into LaTeX."""
    if desc == "1":
        return "1"
    s = desc
    s = re.sub(r"\b(P?[SG]L|PSU|PGL)\((\d+),\s*(\d+)\)", r"\\mathrm{\1}(\2,\3)", s)
    s = re.sub(r"\b([CDSAQ]|QD)(\d+)", r"\1_{\2}", s)
    s = s.replace(" x ", r" \times ").replace(" : ", r" \rtimes ").replace(" . ", r" \cdot ")
    return s


def _sage_dihedral_naming(desc):
    """GAP calls the dihedral group of order 2n "D2n"; Sage's structure_description
    (used for the subgroup labels) calls it "Dn". Use Sage's convention everywhere."""
    return re.sub(r"(\A|\W)D(\d+)", lambda m: f"{m.group(1)}D{int(m.group(2)) // 2}", desc)


def _squarefree(n):
    n = ZZ(n)
    return n.squarefree_part()


def _radical_generator(poly):
    """LaTeX generator for a binomial x^n - c, quadratic, or cyclotomic polynomial, else None."""
    n = poly.degree()
    coeffs = poly.list()

    if n == 2:
        b, a = coeffs[1], coeffs[2]
        d = _squarefree((b * b - 4 * a * coeffs[0]) * a.denominator() ** 2)
        if d == -1:
            return "i"
        return rf"\sqrt{{{d}}}"

    for m in range(3, 200):
        if euler_phi(m) == n and _polredabs(cyclotomic_polynomial(m)) == poly:
            return rf"\zeta_{{{m}}}"
        if euler_phi(m) > 4 * n:
            break

    binom = _binomial(poly)
    if binom:
        return _radical_tex(*binom)

    return None


def _binomial(poly):
    """(n, c) if poly = a*(x^n - c) with n >= 3, normalized so Q(c^(1/n)) is the field; else None."""
    n = poly.degree()
    coeffs = poly.list()
    if n < 3 or any(c != 0 for c in coeffs[1:n]):
        return None
    c = -coeffs[0] / coeffs[n]
    if n % 2 == 1 and c < 0:
        c = -c  # Q((-c)^(1/n)) = Q(c^(1/n)) for odd n
    return n, c


def _radical_tex(n, c):
    return rf"\sqrt[{n}]{{{latex(c)}}}"


def _root_of_unity_tex(n, j):
    """LaTeX for zeta_n^j as a multiplier (empty for j = 0), in lowest terms (zeta_8^2 = i)."""
    if j == 0:
        return ""
    from math import gcd

    g = gcd(j, n)
    n, j = n // g, j // g
    if 2 * j == n:
        return "-"
    if n == 4:
        return "i" if j == 1 else "-i"
    if n == 3:
        return r"\omega" if j == 1 else r"\omega^{2}"
    return rf"\zeta_{{{n}}}" if j == 1 else rf"\zeta_{{{n}}}^{{{j}}}"


def _conjugate_radical_tex(n, c, H, L, emb):
    """Which conjugate Q(zeta_n^j * c^(1/n)) is the fixed field of H: find the
    roots of x^n - c in L that H fixes and take the smallest j."""
    from sage.all import CC  # type: ignore

    rts = [r for r, _ in (_R.gen() ** n - c).roots(L)]
    hgens = H.gens()
    fixed = [r for r in rts if all(h(r) == r for h in hgens)]
    two_pi = 2 * 3.141592653589793

    def arg(r):
        # The embedding is only accurate to ~1e-15: a real root can come out as
        # 1.1487 - 7e-15 i, whose argument is ~2pi rather than 0. Snap those to the
        # real axis first, or the principal root (and every label) shifts by one.
        z = CC(emb(r))
        if abs(z.imag()) <= 1e-9 * abs(z):
            return 0.0 if z.real() > 0 else float(CC.pi())
        return float(z.arg()) % two_pi

    base = min(arg(r) for r in rts)  # principal root: smallest argument
    js = sorted(round((arg(r) - base) / (two_pi / n)) % n for r in fixed)
    if not js:
        return _radical_tex(n, c)
    return _root_of_unity_tex(n, js[0]) + _radical_tex(n, c)


def _field_tex(gens):
    return r"\mathbb{Q}(" + ", ".join(gens) + ")"


def compute_lattice(polynomial_str):
    x = _R.gen()
    from sage.all import sage_eval  # type: ignore

    f = sage_eval(polynomial_str, locals={"x": x})
    f = _R(f)

    if not f.is_irreducible():
        return {"available": False, "reason": "The polynomial is reducible over $\\mathbb{Q}$."}

    if f.degree() == 1:
        return {
            "available": True,
            "group_order": 1,
            "roots": describe_roots(f)["roots"],
            "root_notes": [],
            "nodes": [_node(0, 1, 1, True, 0, 1, 0, "1", r"\mathbb{Q}", "x", 1, False, "1")],
            "edges": [],
        }

    K = NumberField(f, "a")
    order = int(K.galois_group().order())
    if order > MAX_GROUP_ORDER:
        return {
            "available": False,
            "group_order": order,
            "reason": f"The Galois group has order {order}; lattices are drawn for groups of order at most {MAX_GROUP_ORDER}.",
        }

    L = K.galois_closure("b")
    G = L.galois_group()
    subs = list(G.subgroups())
    if len(subs) > MAX_SUBGROUPS:
        return {
            "available": False,
            "group_order": order,
            "reason": f"The Galois group has {len(subs)} subgroups; lattices are drawn for at most {MAX_SUBGROUPS}.",
        }

    sets = [frozenset(H) for H in subs]

    # Conjugacy classes of subgroups (conjugate subgroups <-> isomorphic, Q-conjugate fields).
    G_gap = libgap(G)
    gap_subs = [libgap(H) for H in subs]
    class_of = [None] * len(subs)
    n_classes = 0
    for i in range(len(subs)):
        if class_of[i] is not None:
            continue
        class_of[i] = n_classes
        for j in range(i + 1, len(subs)):
            if class_of[j] is None and len(sets[j]) == len(sets[i]) and bool(
                libgap.IsConjugate(G_gap, gap_subs[i], gap_subs[j])
            ):
                class_of[j] = n_classes
        n_classes += 1
    class_members = {}
    for i, c in enumerate(class_of):
        class_members.setdefault(c, []).append(i)

    # Name each automorphism by how it permutes the roots alpha_1..alpha_n of f,
    # so subgroups that are isomorphic (e.g. several C_2's) are still visibly different.
    emb = L.complex_embeddings()[0]
    roots, root_info = _ordered_roots(f, L, emb)
    perm_of = {g: tuple(roots.index(g(r)) for r in roots) for g in G}

    stem = _polredabs(f)
    f_radical = _radical_generator(f) if f.degree() > 1 else None

    raw = []
    for i, H in enumerate(subs):
        F, _ = H.fixed_field()
        deg = int(F.degree())
        poly = _polredabs(F.polynomial()) if deg > 1 else x
        raw.append({
            "order": int(H.order()),
            "index": order // int(H.order()),
            "normal": bool(H.is_normal(G)),
            "group_desc": str(H.structure_description()),
            "quotient_desc": (
                _sage_dihedral_naming(str(libgap.StructureDescription(libgap.FactorGroup(G_gap, gap_subs[i]))))
                if H.is_normal(G) else None
            ),
            "poly": poly,
            "deg": deg,
            "generators": [_cycles_latex(p) for p in _small_generating_set([perm_of[h] for h in H])],
        })

    # Field labels: a list of LaTeX generators per node (None = no nice form yet).
    # Conjugate (non-Galois) fields get their specific generator, e.g. Q(∛2),
    # Q(ω∛2), Q(ω²∛2), or Q(α_1), Q(α_2), ..., instead of one shared label.
    gens = [None] * len(subs)
    for i, r in enumerate(raw):
        has_conjugates = len(class_members[class_of[i]]) > 1
        if r["deg"] == 1:
            gens[i] = []
            continue
        src = f if (r["poly"] == stem and f_radical) else r["poly"]
        g = _radical_generator(src)
        binom = _binomial(src)
        if g and binom and has_conjugates:
            gens[i] = [_conjugate_radical_tex(*binom, subs[i], L, emb)]
        elif g:
            gens[i] = [g]
        elif r["poly"] == stem:
            # A stem field is generated by any root of f it contains: name the first one H fixes.
            fixed = [k for k in range(len(roots)) if all(perm_of[h][k] == k for h in subs[i])]
            gens[i] = [rf"\alpha_{{{fixed[0] + 1}}}" if (has_conjugates and fixed) else r"\alpha"]

    # Compositums: L^(H1 ∩ H2) = L^H1 · L^H2. Pair at least one Galois (normal)
    # field so we never produce nonsense like Q(∛2, ∛2) from two conjugates.
    by_degree = sorted(range(len(subs)), key=lambda k: (raw[k]["deg"], str(gens[k])))
    for i in by_degree:
        if gens[i] is not None:
            continue
        best = None
        for a in by_degree:
            if not gens[a] or raw[a]["deg"] >= raw[i]["deg"]:
                continue
            for b in by_degree:
                if b == a or not gens[b] or raw[b]["deg"] >= raw[i]["deg"]:
                    continue
                if not (raw[a]["normal"] or raw[b]["normal"]):
                    continue
                if sets[a] & sets[b] != sets[i]:
                    continue
                combined = list(dict.fromkeys(gens[a] + gens[b]))
                if len(combined) > 3:
                    continue
                key = (len(combined), raw[a]["deg"] + raw[b]["deg"], sum(len(g) for g in combined))
                if best is None or key < best[0]:
                    best = (key, combined)
        if best:
            gens[i] = best[1]

    labels = [None] * len(subs)
    theta = 0
    for i in by_degree:
        r = raw[i]
        if gens[i] is not None:
            labels[i] = r"\mathbb{Q}" if not gens[i] else _field_tex(gens[i])
        elif r["order"] == 1:
            labels[i] = "L"
        else:
            theta += 1
            labels[i] = rf"\mathbb{{Q}}(\theta_{{{theta}}})"

    nodes = []
    for i, r in enumerate(raw):
        label = labels[i]
        members = class_members[class_of[i]]
        nodes.append(_node(
            i, r["order"], r["index"], r["normal"], class_of[i], len(members), members.index(i),
            group_latex(r["group_desc"]), label, latex(r["poly"]), r["deg"], r["poly"] == stem,
            group_latex(r["quotient_desc"]) if r["quotient_desc"] else None,
            r["generators"],
        ))

    # Covering relations H_i ⋖ H_j (H_i maximal in H_j).
    edges = []
    for i, si in enumerate(sets):
        for j, sj in enumerate(sets):
            if i != j and si < sj and not any(si < sk < sj for sk in sets):
                edges.append([i, j])

    return {
        "available": True,
        "group_order": order,
        "roots": root_info["roots"],
        "root_notes": root_info["notes"],
        "nodes": nodes,
        "edges": edges,
    }


def _ordered_roots(f, L, emb):
    """Roots of f in L numbered alpha_1..alpha_n in the canonical order of
    roots.canonical_roots (the order the results panel uses), by matching each
    root's image under the complex embedding emb to the nearest canonical value."""
    canon = canonical_roots(f)
    ordered = [None] * len(canon)
    for r, _ in f.roots(L):
        z = complex(emb(r))
        k = min(range(len(canon)), key=lambda i: abs(z - complex(canon[i])))
        if ordered[k] is not None:
            raise ValueError(f"two roots of {f} matched the same numerical root")
        ordered[k] = r
    return ordered, describe_roots(f, values=canon)


def _compose(p, q):
    """(p ∘ q)(k) = p(q(k)) for permutations as tuples."""
    return tuple(p[q[k]] for k in range(len(q)))


def _generated(gens, n):
    identity = tuple(range(n))
    group = {identity}
    frontier = [identity]
    while frontier:
        nxt = []
        for g in frontier:
            for s in gens:
                h = _compose(s, g)
                if h not in group:
                    group.add(h)
                    nxt.append(h)
        frontier = nxt
    return group


def _perm_order(p):
    k, q, identity = 1, p, tuple(range(len(p)))
    while q != identity:
        q = _compose(p, q)
        k += 1
    return k


def _small_generating_set(elements):
    """Greedy: take high-order elements first until they generate the whole subgroup."""
    elements = list(elements)
    n = len(elements[0])
    target = set(elements)
    gens, current = [], {tuple(range(n))}
    for p in sorted(elements, key=lambda p: (-_perm_order(p), p)):
        if current == target:
            break
        if p not in current:
            gens.append(p)
            current = _generated(gens, n)
    return gens


def _cycles_latex(p):
    """Cycle notation on root indices, e.g. (1\\,3)(2\\,4)."""
    seen, cycles = set(), []
    for start in range(len(p)):
        if start in seen or p[start] == start:
            seen.add(start)
            continue
        cycle, k = [], start
        while k not in seen:
            seen.add(k)
            cycle.append(str(k + 1))
            k = p[k]
        cycles.append("(" + r"\,".join(cycle) + ")")
    return "".join(cycles) or r"\mathrm{id}"


def _node(i, h_order, index, normal, class_id, class_size, class_pos, g_tex, f_tex, poly_tex, deg, is_stem,
          q_tex=None, generators=None):
    return {
        "id": i,
        "subgroup_order": h_order,
        "index": index,
        "normal": normal,
        "class_id": class_id,
        "class_size": class_size,
        "class_position": class_pos,
        "group_latex": g_tex,
        "field_latex": f_tex,
        "field_polynomial": poly_tex,
        "field_degree": deg,
        "is_stem_field": is_stem,
        "quotient_latex": q_tex,
        "generators": generators or [],
    }
