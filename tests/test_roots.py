"""Tests for roots.py. Run with: pixi run test"""

import sys
from pathlib import Path

import pytest
import sympy as sp

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sage.all import QQ, PolynomialRing  # type: ignore  # noqa: E402

import roots  # noqa: E402

R = PolynomialRing(QQ, "x")
x = R.gen()
X = sp.Symbol("x")


def latexes(f):
    return [r["latex"] for r in roots.describe_roots(f)["roots"]]


# --- Exactness: every closed form a strategy produces has minimal polynomial f ---

CERTIFY = [
    x**2 - 2, x**2 + 3, 2 * x**2 - 3 * x - 1, x**3 - 2, x**3 - 16, 2 * x**3 - 1, x**4 - 2, x**4 + 2,
    x**5 - 2, x**6 + 3, x**8 - 2, x**4 + 1, x**4 + x**3 + x**2 + x + 1, x**4 - x**2 + 1,
    x**3 - 3 * x + 1, x**3 - 3 * x - 1, x**4 - 10 * x**2 + 1, x**4 - 4 * x**2 + 1, x**3 - x - 1, x - 3,
    x**3 + x + 1, x**3 + x**2 - 2 * x - 1, x**4 + 4 * x**2 + 2, 2 * x**3 - 6 * x**2 + 1,
]


@pytest.mark.parametrize("f", CERTIFY, ids=str)
def test_closed_forms_are_exact_roots(f):
    monic = R(f).monic()
    target = [sp.Rational(str(c)) for c in reversed(monic.list())]
    produced = 0
    for strategy in roots._STRATEGIES:
        candidates = strategy(monic)
        if candidates is None:
            continue
        for expr, tex, _ in candidates:
            if tex is None or sp.count_ops(expr) > roots.MAX_SYMPY_OPS:
                continue
            # minimal_polynomial returns an integer multiple (2x^3 - 1); compare monic coefficients.
            minpoly = sp.Poly(sp.minimal_polynomial(expr, X), X).monic()
            assert [sp.Rational(c) for c in minpoly.all_coeffs()] == target, (strategy.__name__, tex)
            produced += 1
    assert produced > 0


# --- Canonical order and the displayed forms ---

def test_order_is_by_argument_then_modulus():
    # x^3 - 2: real root first, then the root in the upper half-plane, then its conjugate.
    assert latexes(x**3 - 2) == [r"\sqrt[3]{2}", r"\omega\sqrt[3]{2}", r"\omega^{2}\sqrt[3]{2}"]


@pytest.mark.parametrize(
    "f, expected",
    [
        (x**2 - 2, [r"\sqrt{2}", r"-\sqrt{2}"]),
        (x**2 + 1, ["i", "-i"]),
        (x**2 + x + 1, [r"\frac{-1 + \sqrt{3}\,i}{2}", r"\frac{-1 - \sqrt{3}\,i}{2}"]),
        (x**3 - 16, [r"2\sqrt[3]{2}", r"2\omega\sqrt[3]{2}", r"2\omega^{2}\sqrt[3]{2}"]),
        (2 * x**3 - 1, [r"\frac{\sqrt[3]{4}}{2}", r"\frac{\omega\sqrt[3]{4}}{2}", r"\frac{\omega^{2}\sqrt[3]{4}}{2}"]),
        (x**4 - 2, [r"\sqrt[4]{2}", r"i\sqrt[4]{2}", r"-\sqrt[4]{2}", r"-i\sqrt[4]{2}"]),
        (x**4 + 1, [r"\zeta_{8}", r"\zeta_{8}^{3}", r"\zeta_{8}^{5}", r"\zeta_{8}^{7}"]),
        (x**4 - 10 * x**2 + 1, [r"\sqrt{2} + \sqrt{3}", r"\sqrt{3} - \sqrt{2}", r"\sqrt{2} - \sqrt{3}", r"-\sqrt{2} - \sqrt{3}"]),
        # Surds are preferred over the equally exact 2cos(k pi/12).
        (x**4 - 4 * x**2 + 1, [r"\frac{\sqrt{2} + \sqrt{6}}{2}", r"\frac{\sqrt{6} - \sqrt{2}}{2}", r"\frac{\sqrt{2} - \sqrt{6}}{2}", r"\frac{-\sqrt{2} - \sqrt{6}}{2}"]),
        (x**2 + x - 1, [r"\frac{\sqrt{5} - 1}{2}", r"\frac{-1 - \sqrt{5}}{2}"]),
        # Nested radicals use the same term ordering inside.
        (x**4 + 4 * x**2 + 2, [r"\sqrt{2 - \sqrt{2}}\,i", r"\sqrt{2 + \sqrt{2}}\,i", r"-\sqrt{2 - \sqrt{2}}\,i", r"-\sqrt{2 + \sqrt{2}}\,i"]),
        # Minimal polynomial of 2cos(2 pi/7): three real roots, no rational-angle arccos.
        (x**3 + x**2 - 2 * x - 1, [r"2\cos\frac{2\pi}{7}", r"2\cos\frac{4\pi}{7}", r"2\cos\frac{6\pi}{7}"]),
        # One real root: Cardano with real cube roots.
        (x**3 - x - 1, [
            r"\sqrt[3]{\frac{9 + \sqrt{69}}{18}} + \sqrt[3]{\frac{9 - \sqrt{69}}{18}}",
            r"\omega\sqrt[3]{\frac{9 + \sqrt{69}}{18}} + \omega^{2}\sqrt[3]{\frac{9 - \sqrt{69}}{18}}",
            r"\omega^{2}\sqrt[3]{\frac{9 + \sqrt{69}}{18}} + \omega\sqrt[3]{\frac{9 - \sqrt{69}}{18}}",
        ]),
        (x**4 + x**3 + x**2 + x + 1, [r"\zeta_{5}", r"\zeta_{5}^{2}", r"\zeta_{5}^{3}", r"\zeta_{5}^{4}"]),
        (x**3 - 3 * x + 1, [r"2\cos\frac{2\pi}{9}", r"2\cos\frac{4\pi}{9}", r"2\cos\frac{8\pi}{9}"]),
    ],
    ids=lambda v: str(v) if not isinstance(v, list) else "",
)
def test_display_forms(f, expected):
    got = latexes(f)
    assert sorted(got) == sorted(expected)


def test_x8_minus_2_matches_lattice_numbering():
    # alpha_k = zeta_8^(k-1) * 2^(1/8), the numbering the lattice's permutations use.
    got = latexes(x**8 - 2)
    assert got[0] == r"\sqrt[8]{2}"
    assert got[1] == r"\zeta_{8}\sqrt[8]{2}"
    assert got[2] == r"i\sqrt[8]{2}"
    assert got[4] == r"-\sqrt[8]{2}"


def test_roots_of_unity_get_a_note():
    assert roots.describe_roots(x**5 - 2)["notes"] == [r"\zeta_{5} = e^{2\pi i/5}"]
    assert roots.describe_roots(x**3 - 2)["notes"] == [r"\omega = e^{2\pi i/3}"]
    assert roots.describe_roots(x**4 - 2)["notes"] == []


# --- Falling back to decimals ---

def test_unsolvable_quintic_is_decimal_only():
    out = roots.describe_roots(x**5 - x - 1)["roots"]
    assert all(r["latex"] is None for r in out)
    assert out[0]["approx"] == "1.167304"


def test_generic_quartic_is_too_long_to_show():
    assert all(r["latex"] is None for r in roots.describe_roots(x**4 - x - 1)["roots"])


def test_casus_irreducibilis_without_nice_form_falls_back_to_decimals():
    # x^3 - 4x + 1 has three real roots; Cardano would need complex cube roots and
    # arccos(-3 sqrt(3)/16) isn't a rational multiple of pi, so decimals only.
    assert all(r["latex"] is None for r in roots.describe_roots(x**3 - 4 * x + 1)["roots"])


def test_decimal_formatting():
    approx = [r["approx"] for r in roots.describe_roots(x**3 - 2)["roots"]]
    assert approx == ["1.259921", "-0.629961 + 1.091124i", "-0.629961 - 1.091124i"]
    assert [r["approx"] for r in roots.describe_roots(x**2 + 1)["roots"]] == ["1.000000i", "-1.000000i"]
