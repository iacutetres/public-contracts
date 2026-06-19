# Contratación Pública · Panel de Monitorización

Panel web para **monitorizar la contratación pública** de un ayuntamiento español a partir de los datos de la **PLACSP** (Plataforma de Contratación del Sector Público).

Hecho con **React + TypeScript + Vite**. Funciona **100 % en el navegador**, sin backend: descarga los contratos, calcula indicadores (KPIs), y muestra gráficos y un listado filtrable.

> Viene configurado para el **Ayuntamiento de Cullera**, pero puedes adaptarlo a **tu localidad en un minuto** — solo hay que cambiar un código. Ver [Adaptar a tu municipio](#-adaptar-a-tu-municipio).

---

## ✨ Características

- **KPIs**: total licitado, total adjudicado, año de mayor gasto y principal adjudicatario.
- **Gráficos**: evolución anual del gasto, reparto por tipo de contrato y ranking de adjudicatarios.
- **Tabla** de contratos ordenada por fecha, con búsqueda, filtros (tipo y estado) y paginación.
- **Detalle** de cada contrato: importe de licitación y de adjudicación, fin de plazo, fecha de adjudicación, duración, CPV y enlace directo a la ficha en PLACSP.
- **Tema claro / oscuro** con botón en la cabecera (recuerda tu elección).
- Marca de **última actualización** y estado guardado en `localStorage` (no se pierde al recargar).

---

## 🚀 Puesta en marcha

### Requisitos
- [Node.js](https://nodejs.org/) 18 o superior.

### Instalación

```bash
# 1. Clona el repositorio
git clone https://github.com/iacutetres/public-contracts.git
cd public-contracts

# 2. Instala dependencias
npm install

# 3. Arranca el servidor de desarrollo
npm run dev
```

Abre **http://localhost:5173** y pulsa **Actualizar** para cargar los contratos.

### Comandos disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Compila a producción en `/dist` |
| `npm run preview` | Sirve la build de producción en local |

---

## 🏙️ Adaptar a tu municipio

Toda la configuración del municipio está en **un único archivo: `src/config.ts`**. Edítalo y se actualizan automáticamente la cabecera, el título de la pestaña y el favicon.

```ts
export const config = {
  dir3: 'L01461056',                  // ← código DIR3 de tu ayuntamiento
  entidad: 'Ajuntament de Cullera',   // ← nombre que sale en la cabecera
  titulo: 'Contratació Pública',      // ← título principal
  iniciales: 'CP',                    // ← iniciales del logo y el favicon
}
```

### ¿Cómo encuentro el código DIR3 de mi ayuntamiento?

El **DIR3** es el identificador oficial de la unidad orgánica en el sector público. Los ayuntamientos tienen el formato `L01` + código (por ejemplo, Cullera es `L01461056`).

- En el **Directorio Común (DIR3)**: <https://datos.gob.es/es/catalogo/e05024601-directorio-comun-de-unidades-organicas-y-oficinas-dir3>
- O desde el perfil de tu ayuntamiento en la [PLACSP](https://contrataciondelestado.es).

Cambia los valores, guarda, y el panel mostrará los contratos de tu localidad con su nombre y marca. **No hay que tocar nada más.**

> ¿Quieres otro color de acento? Cambia la variable `--accent` en `src/styles.css`.

---

## 🌐 Despliegue en producción

En desarrollo, las peticiones a la API pasan por el **proxy de Vite** (configurado en `vite.config.ts`) para evitar problemas de **CORS**.

En producción **necesitarás un proxy propio** (Cloudflare Worker, Netlify/Vercel Function, etc.) que reenvíe las peticiones al origen de datos, porque el navegador bloqueará las llamadas directas por CORS.

---

## 🗂️ Estructura del proyecto

```
public-contracts/
├── src/
│   ├── config.ts        # ⚙️ configuración del municipio (edita aquí)
│   ├── components/      # KpiCard, Charts, ContractsTable
│   ├── hooks/           # useContracts (lógica), useLocalStorage
│   ├── services/        # placsp (datos de PLACSP)
│   ├── types/           # interfaces TypeScript
│   ├── App.tsx          # composición de la UI
│   ├── main.tsx         # punto de entrada
│   └── styles.css       # estilos globales y temas
├── public/favicon.svg
├── index.html
└── vite.config.ts       # proxy de desarrollo
```

---

## 🛠️ Tecnología

- **React 18** + **TypeScript**
- **Vite** (servidor de desarrollo y build)
- **Recharts** (gráficos)
- Datos: **PLACSP** (Plataforma de Contratación del Sector Público)

---

## 📄 Datos y aviso

Los datos proceden de la **Plataforma de Contratación del Sector Público** ([contrataciondelestado.es](https://contrataciondelestado.es)). Este proyecto es una herramienta de visualización independiente, sin relación oficial con la PLACSP ni con ningún organismo público.

---

## 👤 Autor

Desarrollado por [**iacutetres**](https://github.com/iacutetres).

## 📝 Licencia

Uso libre. Si lo adaptas a tu municipio, ¡comparte mejoras!
