export function descargarBlob(blob: Blob, nombreArchivo: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Para mostrar un blob (ej: PDF) con el visor nativo del navegador en vez de
// forzar la descarga. `ventana` tiene que venir de un window.open() disparado
// de forma sincrónica en el mismo click (antes de cualquier await), así el
// navegador no lo bloquea como pop-up.
export function verBlobEnNuevaPestana(ventana: Window | null, blob: Blob) {
  const url = URL.createObjectURL(blob);
  if (ventana) {
    ventana.location.href = url;
  } else {
    window.open(url, "_blank");
  }
}
