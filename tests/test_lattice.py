"""Consistency between lattice.py and roots.py. Run with: pixi run test"""

import re
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from lattice import compute_lattice  # noqa: E402


def fixed_points(generators, n):
    """1-based root indices fixed by every generator, given in LaTeX cycle notation."""
    moved = set()
    for g in generators:
        moved |= {int(k) for k in re.findall(r"\d+", g)}
    return [k for k in range(1, n + 1) if k not in moved]


@pytest.mark.parametrize("poly", ["x^3-2", "x^5-2", "x^8-2", "x^4-2"])
def test_conjugate_stem_fields_name_the_root_they_fix(poly):
    """The field fixed by Stab(alpha_k) is Q(alpha_k): its label must contain
    exactly the closed form the results panel shows for alpha_k."""
    lat = compute_lattice(poly)
    n = len(lat["roots"])
    checked = 0
    for node in lat["nodes"]:
        if not node["is_stem_field"] or node["class_size"] == 1:
            continue
        fixed = fixed_points(node["generators"], n)
        assert fixed, node
        assert node["field_latex"] == rf"\mathbb{{Q}}({lat['roots'][fixed[0] - 1]['latex']})", (node, fixed)
        checked += 1
    assert checked > 0


def test_center_of_x8_minus_2_is_negation():
    lat = compute_lattice("x^8-2")
    normal_c2 = [n for n in lat["nodes"] if n["subgroup_order"] == 2 and n["normal"]]
    assert len(normal_c2) == 1
    # alpha_k = zeta_8^(k-1) 2^(1/8), so alpha -> -alpha is k -> k + 4.
    assert normal_c2[0]["generators"] == [r"(1\,5)(2\,6)(3\,7)(4\,8)"]
    assert normal_c2[0]["quotient_latex"] == "D_{4}"


def test_degree_one():
    lat = compute_lattice("x-3")
    assert lat["available"] and lat["roots"] == [{"latex": "3", "approx": "3.000000"}]
