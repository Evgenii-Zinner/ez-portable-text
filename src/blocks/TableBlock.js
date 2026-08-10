import { html } from "htm/preact";
import { BlockCardWrapper } from "./BlockCardWrapper.js";
import { ICONS } from "../components/icons.js";

/**
 * Modular Table Block component.
 *
 * @param {object} props
 * @param {object} props.value - Table block JSON value.
 * @param {object} props.schemaType - Compiled schema type.
 * @param {Array} props.path - Tree path inside document.
 */
export function TableBlock({ value, schemaType, path }) {
  const rows = value?.rows || [];

  return html`
    <${BlockCardWrapper}
      typeName="table"
      title=${schemaType?.title || "Table"}
      icon=${ICONS.table}
      value=${value}
      path=${path}
    >
      <div class="pe-preview-table-wrapper">
        <table class="pe-preview-table">
          <tbody>
            ${rows.map(
              (row, rIdx) => html`
                <tr key=${row._key || rIdx}>
                  ${(row.cells || []).map(
                    (cell, cIdx) => html`
                      <td key=${cIdx}>
                        ${cell || html`<span class="pe-td-empty">—</span>`}
                      </td>
                    `,
                  )}
                </tr>
              `,
            )}
          </tbody>
        </table>
      </div>
    <//>
  `;
}
