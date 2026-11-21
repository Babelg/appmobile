import { useAudioPlayer, type AudioPlayer } from 'expo-audio';

import { useProgress } from '@/store/progress';

/** Efeitos de acerto e erro, respeitando a opção de som do Perfil. */
export function useSons() {
  const ligado = useProgress((s) => s.som);
  const acerto = useAudioPlayer(require('../../assets/sons/acerto.wav'));
  const erro = useAudioPlayer(require('../../assets/sons/erro.wav'));
  return (ok: boolean) => {
    if (ligado) tocar(ok ? acerto : erro);
  };
}

/** Toca um efeito do começo (dá para repetir rápido sem esperar o anterior acabar). */
function tocar(player: AudioPlayer) {
  try {
    player.seekTo(0).catch(() => {});
    player.play();
  } catch {
    // sem áudio disponível: segue só com a vibração
  }
}
