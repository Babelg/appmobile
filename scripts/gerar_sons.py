#!/usr/bin/env python3
"""
Gera os efeitos sonoros do app (sintetizados aqui, sem samples de terceiros):
  assets/sons/acerto.wav  dois toques de sino subindo (Dó6 → Sol6), curto e brilhante
  assets/sons/erro.wav    dois toques graves descendo (Mi4 → Si3), macio, sem estridência
Uso: python3 scripts/gerar_sons.py   (precisa de numpy)
"""
import wave
from pathlib import Path

import numpy as np

SR = 44100
SAIDA = Path(__file__).resolve().parent.parent / "assets" / "sons"


def t(seg):
    return np.arange(int(SR * seg)) / SR


def sino(freq, seg, ganho):
    x = t(seg)
    s = sum(a * np.sin(2 * np.pi * freq * r * x) * np.exp(-x * d) for r, a, d in [(1, 1, 7), (2.0, 0.35, 10), (3.0, 0.15, 14)])
    return s * ganho * np.clip(x / 0.003, 0, 1)


def grave(freq, seg, ganho):
    x = t(seg)
    s = np.sin(2 * np.pi * freq * x) + 0.35 * np.sin(2 * np.pi * freq * 2 * x) + 0.12 * np.sign(np.sin(2 * np.pi * freq * x))
    return s * ganho * np.clip(x / 0.006, 0, 1) * np.exp(-x * 9)


def mistura(partes, seg):
    out = np.zeros(int(SR * seg))
    for atraso, sinal in partes:
        i = int(SR * atraso)
        n = min(len(sinal), len(out) - i)
        out[i:i + n] += sinal[:n]
    out *= np.linspace(1, 0, len(out)) ** 0.3  # cauda limpa, sem clique no fim
    return out / np.max(np.abs(out)) * 0.8


def salvar(nome, x):
    SAIDA.mkdir(parents=True, exist_ok=True)
    with wave.open(str(SAIDA / nome), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())
    print("ok", nome, f"{len(x) / SR:.2f} s")


salvar("acerto.wav", mistura([(0, sino(1046.5, 0.5, 0.8)), (0.075, sino(1568.0, 0.5, 0.9))], 0.55))
salvar("erro.wav", mistura([(0, grave(329.6, 0.25, 0.9)), (0.13, grave(246.9, 0.3, 0.9))], 0.45))
