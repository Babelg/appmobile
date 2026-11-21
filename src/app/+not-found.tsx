import { Redirect } from 'expo-router';

/** Qualquer endereço desconhecido (ex.: versão web hospedada em subpasta) volta para a Estrada. */
export default function NotFound() {
  return <Redirect href="/" />;
}
