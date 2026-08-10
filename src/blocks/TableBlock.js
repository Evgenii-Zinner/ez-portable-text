import { html } from "htm/preact";
import { BlockCardWrapper } from "./BlockCardWrapper.js";
import { ICONS } from "../components/icons.js";

/**
 * Interactive Table Block component with inline grid editing.
 *
 * @param {object} props
 * @param {object} props.value - Table block JSON value.
 * @param {object} props.schemaType - Compiled schema type.
 * @param {Array} props.path - Tree path inside document.
 */
export function TableBlock({ value, schemaType, path }) {
  const rows = value?.rows || [
    { _key: "r1", cells: ["Header 1", "Header 2"] },
    { _key: "r2", cells: ["Cell 1", "Cell 2"] },
  ];

  const dispatchUpdate = (patch, target) => {
    const event = new CustomEvent("pe-update-block-data", {
      detail: { value, patch },
      bubbles: true,
      composed: true,
    });
    target.dispatchEvent(event);
  };

  const handleCellChange = (rIdx, cIdx, text, target) => {
    const nextRows = JSON.parse(JSON.stringify(rows));
    if (nextRows[rIdx] && nextRows[rIdx].cells) {
      nextRows[rIdx].cells[cIdx] = text;
      dispatchUpdate({ rows: nextRows }, target);
    }
  };

  const handleAddRow = (e) => {
    const nextRows = JSON.parse(JSON.stringify(rows));
    const colCount = nextRows[0]?.cells?.length || 2;
    const newRowKey = "r_" + Math.random().toString(36).substring(2, 9);
    nextRows.push({ _key: newRowKey, cells: Array(colCount).fill("") });
    dispatchUpdate({ rows: nextRows }, e.target);
  };

  const handleAddColumn = (e) => {
    const nextRows = JSON.parse(JSON.stringify(rows));
    nextRows.forEach((row) => {
      if (!row.cells) row.cells = [];
      row.cells.push("");
    });
    dispatchUpdate({ rows: nextRows }, e.target);
  };

  return html`
    <${BlockCardWrapper}
      typeName="table"
      title=${schemaType?.title || "Table Grid"}
      icon=${ICONS.table}
      value=${value}
      path=${path}
    >
      <div class="pe-preview-table-wrapper">
        <table class="pe-preview-table pe-table-editor">
          <tbody>
            ${rows.map(
              (row, rIdx) => html`
                <tr key=${row._key || rIdx}>
                  ${(row.cells || []).map(
                    (cell, cIdx) => html`
                      <td key=${cIdx}>
                        <input
                          type="text"
                          class="pe-cell-input"
                          value=${cell}
                          placeholder="..."
                          onInput=${(e) => handleCellChange(rIdx, cIdx, e.target.value, e.target)}
                        />
                      </td>
                    `,
                  )}
                </tr>
              `,
            )}
          </tbody>
        </table>
      </div>

      <div class="pe-table-controls">
        <button type="button" class="pe-btn" onClick=${handleAddRow}>
          + Add Row
        </button>
        <button type="button" class="pe-btn" onClick=${handleAddColumn}>
          + Add Column
        </button>
      </div>
    <//>
  `;
}
