CHM_LABEL_TO_TEX = [
    # Degree 1
    ['C_1 \\cong \\{1\\}'], 
    # Degree 2
    ['C_2 \\cong \\mathbb{Z}/2\\mathbb{Z}'],
    # Degree 3
    ['C_3 \\cong \\mathbb{Z}/3\\mathbb{Z}', 'S_3 \\cong D_3'],
    # Degree 4
    ['C_4 \\cong \\mathbb{Z}/4\\mathbb{Z}', 'V_4 \\cong \\mathbb{Z}/2\\mathbb{Z} \\times \\mathbb{Z}/2\\mathbb{Z}', 'D_4', 'A_4', 'S_4'],
    # Degree 5
    ['C_5 \\cong \\mathbb{Z}/5\\mathbb{Z}', 'D_5', 'F_5 \\cong C_5 \\rtimes C_4', 'A_5', 'S_5'],
    # Degree 6
    ['C_6 \\cong \\mathbb{Z}/6\\mathbb{Z}', 'S_6', 'D_6', 'A_6', 'S_3 \\times C_3', 'A_4 \\times C_2', 'S_4', 'S_4', 'S_3 \\times S_3',
     '(C_3 \\times C_3) \\rtimes C_4', 'S_4 \\times C_2', '\\mathrm{PSL}(2, 5)', '(C_3 \\times C_3) \\rtimes D_4', '\\mathrm{PGL}(2, 5)', 'A_6', 'S_6'],
    # Degree 7
    ['C_7 \\cong \\mathbb{Z}/7\\mathbb{Z}', 'D_7', 'C_7 \\rtimes C_3', 'F_7 \\cong C_7 \\rtimes C_6', '\\mathrm{GL}(3, 2)', 'A_7', 'S_7'],
    # Degree 8
    ['C_8 \\cong \\mathbb{Z}/8\\mathbb{Z}', 'C_4 \\times C_2', 'C_2 \\times C_2 \\times C_2', 'D_4', 'Q_8', 'D_8', 'C_8 \\rtimes C_2', 'QD_{16}',
     'D_4 \\times C_2', 'V_4 \\rtimes C_4', 'Q_8 \\rtimes C_2', '\\mathrm{SL}(2, 3)', 'A_4 \\times C_2', 'S_4', 'D_8 \\rtimes C_2',
     '(C_8 \\rtimes C_2) \\rtimes C_2', 'C_4 \\wr C_2', 'V_4 \\wr C_2', '(C_2 \\times C_2 \\times C_2) \\rtimes C_4', '(C_2 \\times C_2 \\times C_2) \\rtimes C_4',
     '(C_2 \\times C_2 \\times C_2) \\rtimes C_4', 'Q_8 \\rtimes V_4', '\\mathrm{GL}(2, 3)', 'S_4 \\times C_2', '(C_2 \\times C_2 \\times C_2) \\rtimes C_7',
     '((C_4 \\times C_4) \\rtimes C_2) \\rtimes C_2', '((C_8 \\rtimes C_2) \\rtimes C_2) \\rtimes C_2', '(((C_4 \\times C_2) \\rtimes C_2) \\rtimes C_2) \\rtimes C_2',
     '(((C_4 \\times C_2) \\rtimes C_2) \\rtimes C_2) \\rtimes C_2', '(((C_4 \\times C_2) \\rtimes C_2) \\rtimes C_2) \\rtimes C_2', '(((C_4 \\times C_2) \\rtimes C_2) \\rtimes C_2) \\rtimes C_2',
     '((C_2 \\times D_4) \\rtimes C_2) \\rtimes C_3', '(V_4 \\times V_4) \\rtimes C_6', '(V_4 \\times V_4) \\rtimes S_3', 'C_2 \\wr C_2 \\wr C_2', '(C_2 \\times C_2 \\times C_2) \\rtimes (C_7 \\rtimes C_3)',
     '\\mathrm{PSL}(2, 7)', 'C_2 \\wr A_4', '(C_2 \\times C_2 \\times C_2) \\rtimes S_4', 'Q_8 \\rtimes S_4', '(V_4 \\times V_4) \\rtimes (S_3 \\times C_2)',
     'A_4 \\wr C_2', '\\mathrm{PGL}(2, 7)', 'C_2 \\wr S_4', '(A_4 \\wr C_2) \\rtimes C_2', '(A_4 \\times A_4) \\rtimes C_2', 'S_4 \\wr C_2', '(C_2 \\times C_2 \\times C_2) \\rtimes \\mathrm{GL}(3, 2)',
     'A_8', 'S_8'],
    # Degree 9
    ['C_9 \\cong \\mathbb{Z}/9\\mathbb{Z}', 'C_3 \\times C_3', 'D_9', 'S_3 \\times C_3', '(C_3 \\times C_3) \\rtimes C_2', 'C_9 \\rtimes C_3', '(C_3 \\times C_3) \\rtimes C_3',
     'S_3 \\times S_3', '(C_3 \\times C_3) \\rtimes C_4', '(C_9 \\rtimes C_3) \\rtimes C_2', '(C_3 \\times C_3) \\rtimes C_6', '((C_3 \\times C_3) \\rtimes C_3) \\rtimes C_2',
     '(C_3 \\times C_3) \\rtimes S_3', '(C_3 \\times C_3) \\rtimes Q_8', '(C_3 \\times C_3) \\rtimes C_8', '(S_3 \\times S_3) \\rtimes C_2', 'C_3 \\wr C_3',
     '(C_3 \\times C_3) \\rtimes D_6', '((C_3 \\times C_3) \\rtimes C_8) \\rtimes C_2', 'C_3 \\wr S_3', '((C_3 \\times C_3 \\times C_3) \\rtimes C_3) \\rtimes C_2',
     '((C_3 \\times C_3 \\times C_3) \\rtimes C_3) \\rtimes C_2', '((C_3 \\times C_3) \\rtimes Q_8) \\rtimes C_3', '(((C_3 \\times C_3 \\times C_3) \\rtimes C_3) \\rtimes C_2) \\rtimes C_2',
     '((C_3 \\times ((C_3 \\times C_3) \\rtimes C_2)) \\rtimes C_2) \\rtimes C_3', '(((C_3 \\times C_3) \\rtimes Q_8) \\rtimes C_3) \\rtimes C_2', '\\mathrm{PSL}(2, 8)', 'S_3 \\wr C_3',
     '(((C_3 \\times ((C_3 \\times C_3) \\rtimes C_2)) \\rtimes C_2) \\rtimes C_3) \\rtimes C_2', '(((C_3 \\times ((C_3 \\times C_3) \\rtimes C_2)) \\rtimes C_2) \\rtimes C_3) \\rtimes C_2',
     'S_3 \\wr S_3', '\\mathrm{P}\\Gamma\\mathrm{L}(2,8)', 'A_9', 'S_9'],
    # Degree 10
    ['C_{10} \\cong \\mathbb{Z}/10\\mathbb{Z}', 'D_5', 'D_{10}', 'F_5', 'F_5 \\times C_2', 'D_5 \\times C_5', 'A_5', '(V_4 \\times V_4) \\rtimes C_5', 'D_5 \\times D_5',
     '(C_5 \\times C_5) \\rtimes C_4', 'A_5 \\times C_2', 'S_5', 'S_5', 'C_2 \\times ((V_4 \\times V_4) \\rtimes C_5)', '((V_4 \\times V_4) \\rtimes C_5) \\rtimes C_2',
     '((V_4 \\times V_4) \\rtimes C_5) \\rtimes C_2', '((C_5 \\times C_5) \\rtimes C_4) \\rtimes C_2', '(C_5 \\times C_5) \\rtimes C_8', '(D_5 \\times D_5) \\rtimes C_2',
     '(C_5 \\times C_5) \\rtimes Q_8', '(D_5 \\times D_5) \\rtimes C_2', 'S_5 \\times C_2', 'C_2 \\times ((V_4 \\times V_4) \\rtimes D_5)', '((V_4 \\times V_4) \\rtimes C_5) \\rtimes C_4',
     '((V_4 \\times V_4) \\rtimes C_5) \\rtimes C_4', '\\mathrm{PSL}(2, 9)', '(D_5 \\wr C_2) \\rtimes C_2', '((C_5 \\times C_5) \\rtimes C_8) \\rtimes C_2',
     '(((V_4 \\times V_4) \\rtimes C_5) \\rtimes C_4) \\times C_2', '\\mathrm{PGL}(2, 9)', 'M_{10}', 'S_6', 'F_5 \\wr C_2', '(V_4 \\times V_4) \\rtimes A_5', '(A_6 \\rtimes C_2) \\rtimes C_2',
     'C_2 \\wr A_5', '((V_4 \\times V_4) \\rtimes A_5) \\rtimes C_2', '((V_4 \\times V_4) \\rtimes A_5) \\rtimes C_2', 'C_2 \\wr S_5', 'A_5 \\wr C_2', '((A_5 \\times A_5) \\rtimes C_2) \\rtimes C_2',
     '(A_5 \\times A_5) \\rtimes C_4', '(S_5 \\times S_5) \\wr C_2', 'A_{10}', 'S_{10}'],
    # Degree 11
    ['C_{11} \\cong \\mathbb{Z}/11\\mathbb{Z}', 'D_{11}', 'C_{11} \\rtimes C_5', 'F_{11} \\cong C_{11} \\rtimes C_{10}', '\\mathrm{PSL}(2, 11)', 'M_{11}', 'A_{11}', 'S_{11}'],
]

def extract_group_notation(group, polynomial):
    """Convert group description to proper LaTeX notation."""

    latex_str = CHM_LABEL_TO_TEX[int(polynomial.degree()) - 1][int(str(group).split()[2].split('T')[1]) - 1]

    # If no specific pattern matched, return the processed string or fallback
    return latex_str if latex_str != None else f"G_{{{group.order()}}}"