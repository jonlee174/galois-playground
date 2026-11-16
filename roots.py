"""
Exact (closed-form) descriptions of the roots of an irreducible f over Q.

Roots are put in one canonical order, by argument in [0, 2*pi) and then by
modulus, so alpha_1, ..., alpha_n mean the same roots everywhere in the app
(the results panel and the Galois-correspondence lattice).

Closed forms are tried in this order of preference:

  1. x^n - c, n >= 3            zeta^j * c^(1/n)
  2. cyclotomic Phi_m            zeta_m^k, gcd(k, m) = 1
  3. cubic with 1 real root      Cardano: -a/3 + cbrt(u) + cbrt(v), complex roots with omega
  4. degree <= 4                 SymPy radicals + sqrtdenest (surds)
  5. minpoly of 2cos(2pi/m)      2cos(2k pi/m)
  6. cubic with 3 real roots     -a/3 + r*cos(k pi/m)  (when the angle is a rational multiple of pi)

The first method whose forms are all displayable wins; otherwise the one that
displays the most roots. A form is displayable if it evaluates to its matching
numerical root (so a wrong formula can never be shown), is at most
MAX_LATEX_LENGTH characters, and doesn't write a real root using i (casus
irreducibilis). The decimal is always shown too, and alone when nothing fits.
"""

import logging
from math import gcd

import sympy as sp
from sage.all import QQ, ComplexField, CyclotomicField, PolynomialRing, cyclotomic_polynomial, euler_phi  # type: ignore

MAX_LATEX_LENGTH = 100
# A radical expression with more operations than this is never readable, and
# denesting it can be slow, so it's rejected before any further work.
MAX_SYMPY_OPS = 80
DECIMALS = 6

log = logging.getLogger(__name__)

_R = PolynomialRing(QQ, "x")
_CF = ComplexField(200)
_TWO_PI = 2 * sp.pi
_X = sp.Symbol("x")


# ----------------------------------------------------------------------------
# Canonical numerical roots
# ----------------------------------------------------------------------------

def _is_zero(t, scale):
    return abs(t) < 1e-40 * max(1, scale)


def canonical_roots(f):
    """Roots of f in C to 200 bits, sorted by (argument in [0, 2*pi), modulus)."""
    f = _R(f)
    vals = f.roots(_CF, multiplicities=False)

    def key(z):
        re, im = z.real(), z.imag()
        if _is_zero(im, abs(z)):
            arg = 0.0 if re > 0 else float(_CF.pi())
        else:
            arg = float(z.arg())
            if arg < 0:
                arg += 2 * float(_CF.pi())
        return (round(arg, 12), float(abs(z)))

    return sorted(vals, key=key)


def _format_decimal(z):
    re, im = z.real(), z.imag()
    scale = abs(z)
    re = 0 if _is_zero(re, scale) else float(re)
    im = 0 if _is_zero(im, scale) else float(im)
    if im == 0:
        return f"{re:.{DECIMALS}f}"
    imag = f"{abs(im):.{DECIMALS}f}i"
    if re == 0:
        return ("-" if im < 0 else "") + imag
    return f"{re:.{DECIMALS}f} {'-' if im < 0 else '+'} {imag}"


# ----------------------------------------------------------------------------
# LaTeX for SymPy expressions (controlled term order, radicals as \sqrt[n]{})
# ----------------------------------------------------------------------------

def _factor_latex(e):
    """LaTeX for one non-numeric factor: a rational power, a cosine, or anything else."""
    if isinstance(e, sp.Pow) and e.exp.is_Rational and e.exp > 0 and e.exp.q > 1:
        p, q = int(e.exp.p), int(e.exp.q)
        if e.base.is_Integer and e.base > 0:
            inner = str(sp.Integer(e.base) ** p)
        elif p == 1:
            inner = to_latex(e.base)  # nested radical: same term ordering inside
        else:
            inner = None
        if inner is not None:
            return rf"\sqrt{{{inner}}}" if q == 2 else rf"\sqrt[{q}]{{{inner}}}"
    if isinstance(e, sp.cos):
        ratio = sp.nsimplify(e.args[0] / sp.pi)
        if ratio.is_Rational:
            num, den = int(ratio.p), int(ratio.q)
            top = r"\pi" if num == 1 else rf"{num}\pi"
            return rf"\cos\frac{{{top}}}{{{den}}}" if den != 1 else rf"\cos {top}"
    return sp.latex(e)


def _term_parts(term):
    """Split a product into (rational coefficient, is_imaginary, [factor latex])."""
    coeff, rest = term.as_coeff_Mul()
    coeff = sp.Rational(coeff)
    factors = sp.Mul.make_args(rest)
    imaginary = sp.I in factors
    factors = [f for f in factors if f not in (sp.I, sp.S.One)]
    return coeff, imaginary, [_factor_latex(f) for f in sorted(factors, key=sp.default_sort_key)]


def to_latex(expr):
    """LaTeX over a common denominator with real terms before imaginary ones and,
    within each, positive terms first (constants before radicals): so
    (\\sqrt{5} - 1)/2 and \\sqrt{3} - \\sqrt{2}, but (-1 + \\sqrt{3} i)/2."""
    expr = sp.expand_mul(expr, deep=False)
    terms = [_term_parts(t) for t in sp.Add.make_args(expr)]
    terms.sort(key=lambda t: (t[1], bool(t[0] < 0), len(t[2]) > 0, t[2]))

    denom = 1
    for coeff, _, _ in terms:
        denom = denom * int(coeff.q) // gcd(denom, int(coeff.q))

    pieces = []
    for coeff, imaginary, factors in terms:
        k = coeff * denom
        body = "".join(factors)
        if imaginary:
            body = body + (r"\,i" if body else "i")
        mag = abs(int(k))
        text = body if (mag == 1 and body) else f"{mag}{body}"
        pieces.append(("-" if k < 0 else "+", text))

    if len(pieces) == 1:
        sign, text = pieces[0]
        body = rf"\frac{{{text}}}{{{denom}}}" if denom != 1 else text
        return ("-" if sign == "-" else "") + body

    numerator = ("-" if pieces[0][0] == "-" else "") + pieces[0][1]
    for sign, text in pieces[1:]:
        numerator += f" {sign} {text}"
    return rf"\frac{{{numerator}}}{{{denom}}}" if denom != 1 else numerator


# ----------------------------------------------------------------------------
# Roots of unity as multipliers
# ----------------------------------------------------------------------------

def _unity_latex(m, j):
    """zeta_m^j in lowest terms: '' for 1, '-' for -1, i, omega, zeta_m^j."""
    j %= m
    if j == 0:
        return "", set()
    g = gcd(j, m)
    m, j = m // g, j // g
    if m == 2:
        return "-", set()
    if m == 4:
        return ("i" if j == 1 else "-i"), set()
    if m == 3:
        return (r"\omega" if j == 1 else r"\omega^{2}"), {3}
    return (rf"\zeta_{{{m}}}" if j == 1 else rf"\zeta_{{{m}}}^{{{j}}}"), {m}


def _unity_note(m):
    return r"\omega = e^{2\pi i/3}" if m == 3 else rf"\zeta_{{{m}}} = e^{{2\pi i/{m}}}"


# ----------------------------------------------------------------------------
# Strategies: each returns [(sympy expr, latex, roots-of-unity used)] for all
# n roots, or None if it doesn't apply.
# ----------------------------------------------------------------------------

def _binomial(f):
    n = f.degree()
    coeffs = f.list()
    if n < 3 or any(c != 0 for c in coeffs[1:n]):
        return None
    c = sp.Rational(str(-coeffs[0]))  # f is monic: x^n = c
    rho = sp.root(abs(c), n)  # real positive n-th root, SymPy-simplified (16^(1/3) = 2*2^(1/3))
    coef, radical = rho.as_coeff_Mul()
    coef = sp.Rational(coef)
    rad_tex = "" if radical == 1 else to_latex(radical)

    m, offset, step = (n, 0, 1) if c > 0 else (2 * n, 1, 2)
    out = []
    for k in range(n):
        j = offset + step * k
        mult, used = _unity_latex(m, j)
        sign = "-" if mult.startswith("-") else ""
        mult = mult.lstrip("-")
        top = ((f"{coef.p}" if coef.p != 1 else "") + mult + rad_tex) or "1"
        tex = sign + (rf"\frac{{{top}}}{{{coef.q}}}" if coef.q != 1 else top)
        out.append((sp.exp(_TWO_PI * sp.I * j / m) * rho, tex, used))
    return out


def _cyclotomic(f):
    n = f.degree()
    if n < 3:
        return None
    for m in range(3, 4 * n * n + 1):
        if euler_phi(m) == n and f == _R(cyclotomic_polynomial(m)):
            return [
                (sp.exp(_TWO_PI * sp.I * k / m), *_unity_latex(m, k))
                for k in range(1, m) if gcd(k, m) == 1
            ]
    return None


def _trig_cubic(f):
    """x^3 + a x^2 + b x + c with three real roots, via
    x = -a/3 + 2 sqrt(-p/3) cos(arccos(C)/3 - 2 pi k/3), when arccos(C) is a rational multiple of pi."""
    if f.degree() != 3 or f.discriminant() <= 0:
        return None
    _, b2, b1, b0 = (sp.Rational(str(t)) for t in reversed(f.list()))
    a, b, c = b2, b1, b0
    p = b - a**2 / 3
    q = 2 * a**3 / 27 - a * b / 3 + c
    C = sp.nsimplify(3 * q / (2 * p) * sp.sqrt(-3 / p))
    if not (C.is_Rational and C in (0, sp.Rational(1, 2), sp.Rational(-1, 2))):
        return None
    theta = sp.acos(C)
    scale = 2 * sp.sqrt(-p / 3)
    out = []
    for k in range(3):
        angle = sp.Mod(theta / 3 - _TWO_PI * k / 3, _TWO_PI)
        if angle > sp.pi:
            angle = _TWO_PI - angle  # cos is even: keep the angle in [0, pi]
        expr = -a / 3 + scale * sp.cos(angle, evaluate=False)
        out.append((expr, to_latex(expr), set()))
    return out


def _real_cyclotomic(f):
    """f is the minimal polynomial of 2cos(2pi/m): roots 2cos(2k pi/m), gcd(k, m) = 1."""
    n = f.degree()
    if n < 3:
        return None  # quadratics read better as surds: (sqrt(5) - 1)/2, not 2cos(2pi/5)
    for m in range(7, 8 * n * n + 1):
        if euler_phi(m) != 2 * n:
            continue
        z = CyclotomicField(m).gen()
        if f == _R((z + 1 / z).minpoly()):
            out = []
            for k in range(1, m // 2 + 1):
                if gcd(k, m) == 1:
                    # evaluate=False: SymPy would otherwise expand e.g. cos(pi/16) into nested radicals.
                    expr = 2 * sp.cos(_TWO_PI * k / m, evaluate=False)
                    out.append((expr, to_latex(expr), set()))
            return out
    return None


def _cardano(f):
    """Cubic with one real root: x = -a/3 + cbrt(u) + cbrt(v), u, v = -q/2 +- sqrt(D),
    using real cube roots; the complex roots are -a/3 + w cbrt(u) + w^2 cbrt(v) and its conjugate."""
    if f.degree() != 3 or f.discriminant() >= 0:
        return None
    _, a, b, c = (sp.Rational(str(t)) for t in reversed(f.list()))
    p = b - a**2 / 3
    q = 2 * a**3 / 27 - a * b / 3 + c
    D = (q / 2) ** 2 + (p / 3) ** 3  # > 0 exactly when the discriminant is < 0
    u = -q / 2 + sp.sqrt(D)
    v = -q / 2 - sp.sqrt(D)

    def cbrt(t):
        """(sympy value, latex) of the real cube root, with the sign pulled outside."""
        neg = bool(t < 0)
        mag = -t if neg else t
        return (-1 if neg else 1) * sp.real_root(mag, 3), neg, rf"\sqrt[3]{{{to_latex(mag)}}}"

    (cu, nu, tu), (cv, nv, tv) = cbrt(u), cbrt(v)
    shift = -a / 3
    shift_tex = to_latex(shift) if shift != 0 else ""
    w = sp.Rational(-1, 2) + sp.sqrt(3) * sp.I / 2

    def combine(mu, mv):
        parts = []
        for neg, mult, rad in ((nu, mu, tu), (nv, mv, tv)):
            parts.append(("-" if neg else "+", mult + rad))
        tex = shift_tex
        for sign, body in parts:
            tex = (f"{tex} {sign} {body}" if tex else ("-" + body if sign == "-" else body))
        return tex

    return [
        (shift + cu + cv, combine("", ""), set()),
        (shift + w * cu + w**2 * cv, combine(r"\omega", r"\omega^{2}"), {3}),
        (shift + w**2 * cu + w * cv, combine(r"\omega^{2}", r"\omega"), {3}),
    ]


def _sympy_radicals(f):
    if f.degree() > 4:
        return None
    poly = sp.Poly([sp.Rational(str(t)) for t in reversed(f.list())], _X)
    found = sp.roots(poly, cubics=True, quartics=True)
    if sum(found.values()) != f.degree():
        return None
    out = []
    for r in found:
        if sp.count_ops(r) > MAX_SYMPY_OPS:
            out.append((r, None, set()))
            continue
        r = sp.sqrtdenest(r)
        out.append((r, to_latex(r), set()))
    return out


_STRATEGIES = (_binomial, _cyclotomic, _cardano, _sympy_radicals, _real_cyclotomic, _trig_cubic)


# ----------------------------------------------------------------------------
# Matching closed forms to numerical roots
# ----------------------------------------------------------------------------

def _match(candidates, values):
    """Map each candidate to the numerical root it equals. Returns {root index:
    (expr, latex, unity)} or None if any candidate doesn't match a distinct root."""
    assigned = {}
    for expr, tex, used in candidates:
        z = complex(sp.N(expr, 50))
        dists = [abs(z - complex(v)) for v in values]
        k = min(range(len(values)), key=dists.__getitem__)
        if dists[k] > 1e-9 * max(1.0, abs(z)) or k in assigned:
            return None
        assigned[k] = (expr, tex, used)
    return assigned if len(assigned) == len(values) else None


def _displayable(entry, z):
    expr, tex, _ = entry
    if tex is None or len(tex) > MAX_LATEX_LENGTH:
        return False
    # A real number written with i inside (casus irreducibilis) is exact but misleading.
    return not (_is_zero(z.imag(), abs(z)) and expr.has(sp.I))


def describe_roots(f, values=None):
    """JSON-ready roots of f in canonical order:
    {"roots": [{"latex": str | None, "approx": str}], "notes": [str]}."""
    f = _R(f).monic()
    values = values if values is not None else canonical_roots(f)

    best = {}
    for strategy in _STRATEGIES:
        # Closed forms are a display nicety: a SymPy failure on an odd input must
        # not take down the whole computation, so it just falls through to decimals.
        try:
            candidates = strategy(f)
        except Exception:  # noqa: BLE001
            log.exception("root strategy %s failed for %s", strategy.__name__, f)
            continue
        if candidates is None:
            continue
        matched = _match(candidates, values)
        if matched is None:
            log.warning("root strategy %s produced forms that don't match the roots of %s", strategy.__name__, f)
            continue
        shown = {k: e for k, e in matched.items() if _displayable(e, values[k])}
        if len(shown) > len(best):
            best = shown
        if len(best) == len(values):
            break

    roots, unity = [], set()
    for k, z in enumerate(values):
        _, tex, used = best.get(k, (None, None, set()))
        unity |= used
        roots.append({"latex": tex, "approx": _format_decimal(z)})

    return {"roots": roots, "notes": [_unity_note(m) for m in sorted(unity)]}
