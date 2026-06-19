/**
 * Configuración del municipio.
 * Para adaptar el panel a tu ayuntamiento, cambia SOLO este archivo.
 */
export const config = {
  /**
   * Código DIR3 del organismo (formato L01 + código).
   * Cómo encontrarlo: ver el README → "Adaptar a tu municipio".
   * Ejemplo Cullera: 'L01461056'
   */
  dir3: 'L01461056',

  /** Nombre de la entidad que aparece en la cabecera y el subtítulo. */
  entidad: 'Ajuntament de Cullera',

  /** Título principal que aparece en la cabecera. */
  titulo: 'Contratació Pública',

  /** Iniciales que se muestran en el logo (cabecera) y en el favicon. */
  iniciales: 'CP',
} as const
