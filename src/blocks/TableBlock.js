import { html } from "htm/preact";
import { BlockCardWrapper } from "./BlockCardWrapper.js";
import { ICONS } from "../components/icons.js";

/**
 * Interactive Table Block component with inline grid editing, event isolation,
 * smart header row toggling, and edge insertion/deletion handles.
 *
 * @param {object} props
 * @param {object} props.value - Table block JSON value.
 * @param {object} props.schemaType - Compiled schema type.
 * @param {Array} props.path - Tree path inside document.
 */
export function TableBlock({ value, schemaType, path }) {
  const withHeadings = !!value?.withHeadings;
  const rows = value?.rows || [
    { _key: "r1", cells: ["Header 1", "Header 2"] },
    { _key: "r2", cells: ["Cell 1", "Cell 2"] },
  ];

  const colCount = rows[0]?.cells?.length || 2;

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

  const handleToggleHeaders = (e) => {
    const checked = e.target.checked;
    const nextRows = JSON.parse(JSON.stringify(rows));

    if (checked) {
      // Prepend blank header row at index 0
      const newKey = "r_hdr_" + Math.random().toString(36).substring(2, 9);
      nextRows.unshift({ _key: newKey, cells: Array(colCount).fill("") });
    } else {
      // Remove header row at index 0 if more than 1 row exists
      if (nextRows.length > 1) {
        nextRows.shift();
      }
    }

    dispatchUpdate({ withHeadings: checked, rows: nextRows }, e.target);
  };

  const handleInsertRowAt = (rIdx, target) => {
    const nextRows = JSON.parse(JSON.stringify(rows));
    const newRowKey = "r_" + Math.random().toString(36).substring(2, 9);
    const newRow = { _key: newRowKey, cells: Array(colCount).fill("") };
    nextRows.splice(rIdx, 0, newRow);
    dispatchUpdate({ rows: nextRows }, target);
  };

  const handleDeleteRow = (rIdx, target) => {
    if (rows.length <= 1) return;
    const nextRows = JSON.parse(JSON.stringify(rows));
    nextRows.splice(rIdx, 1);
    dispatchUpdate({ rows: nextRows }, target);
  };

  const handleInsertColAt = (cIdx, target) => {
    const nextRows = JSON.parse(JSON.stringify(rows));
    nextRows.forEach((row) => {
      if (!row.cells) row.cells = [];
      row.cells.splice(cIdx, 0, "");
    });
    dispatchUpdate({ rows: nextRows }, target);
  };

  const handleDeleteCol = (cIdx, target) => {
    if (colCount <= 1) return;
    const nextRows = JSON.parse(JSON.stringify(rows));
    nextRows.forEach((row) => {
      if (row.cells) {
        row.cells.splice(cIdx, 1);
      }
    });
    dispatchUpdate({ rows: nextRows }, target);
  };

  // Prevent event bubbling to PortableText editor (so Ctrl+X, Ctrl+C, Backspace work inside input fields)
  const stopEditorEvents = (e) => {
    e.stopPropagation();
  };

  const headerActions = html`
    <label class="pe-toggle-switch" title="Toggle Table Header Row">
      <input
        type="checkbox"
        checked=${withHeadings}
        onChange=${handleToggleHeaders}
      />
      <span class="pe-toggle-slider"></span>
      <span class="pe-toggle-label">Headers</span>
    </label>
  `;

  return html`
    <${BlockCardWrapper}
      typeName="table"
      title=${schemaType?.title || "Table Grid"}
      icon=${ICONS.table}
      value=${value}
      path=${path}
      headerActions=${headerActions}
    >
      <div class="pe-table-editor-container">
        <!-- Column Controls Bar -->
        <div class="pe-table-col-bar">
          <div class="pe-table-corner-space"></div>
          <div class="pe-table-col-controls">
            ${Array.from({ length: colCount }).map(
              (_, cIdx) => html`
                <div key=${cIdx} class="pe-table-col-item">
                  <button
                    type="button"
                    class="pe-table-edge-btn pe-table-add-col-btn"
                    title="Insert column before"
                    onClick=${(e) => handleInsertColAt(cIdx, e.target)}
                  >
                    ${ICONS.plus}
                  </button>
                  ${colCount > 1 &&
                  html`
                    <button
                      type="button"
                      class="pe-table-edge-btn pe-table-del-col-btn"
                      title="Delete column"
                      onClick=${(e) => handleDeleteCol(cIdx, e.target)}
                    >
                      ${ICONS.trash}
                    </button>
                  `}
                </div>
              `,
            )}
            <button
              type="button"
              class="pe-table-edge-btn pe-table-add-col-btn pe-table-add-col-end"
              title="Add column to end"
              onClick=${(e) => handleInsertColAt(colCount, e.target)}
            >
              ${ICONS.plus}
            </button>
          </div>
        </div>

        <!-- Table Body Grid with Row Controls -->
        <div class="pe-table-body-grid">
          <div class="pe-preview-table-wrapper">
            <table class="pe-preview-table pe-table-editor ${withHeadings ? "pe-table-has-header" : ""}">
              <tbody>
                ${rows.map((row, rIdx) => {
                  const isHeaderRow = withHeadings && rIdx === 0;
                  return html`
                    <tr key=${row._key || rIdx} class=${isHeaderRow ? "pe-table-header-row" : ""}>
                      <!-- Row Edge Handle -->
                      <td class="pe-table-row-handle-td">
                        <div class="pe-table-row-handle-box">
                          <button
                            type="button"
                            class="pe-table-edge-btn pe-table-add-row-btn"
                            title="Insert row above"
                            onClick=${(e) => handleInsertRowAt(rIdx, e.target)}
                          >
                            ${ICONS.plus}
                          </button>
                          ${rows.length > 1 &&
                          html`
                            <button
                              type="button"
                              class="pe-table-edge-btn pe-table-del-row-btn"
                              title="Delete row"
                              onClick=${(e) => handleDeleteRow(rIdx, e.target)}
                            >
                              ${ICONS.trash}
                            </button>
                          `}
                        </div>
                      </td>

                      ${(row.cells || []).map(
                        (cell, cIdx) => html`
                          <td key=${cIdx}>
                            <input
                              type="text"
                              class="pe-cell-input ${isHeaderRow ? "pe-cell-header-input" : ""}"
                              value=${cell}
                              placeholder=${isHeaderRow ? "Header..." : "..."}
                              onInput=${(e) => handleCellChange(rIdx, cIdx, e.target.value, e.target)}
                              onKeyDown=${stopEditorEvents}
                              onKeyUp=${stopEditorEvents}
                              onCut=${stopEditorEvents}
                              onCopy=${stopEditorEvents}
                              onPaste=${stopEditorEvents}
                            />
                          </td>
                        `,
                      )}
                    </tr>
                  `;
                })}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Add Row at Bottom Edge -->
        <div class="pe-table-bottom-add-row">
          <button
            type="button"
            class="pe-table-edge-btn pe-table-add-row-btn"
            title="Add row to bottom"
            onClick=${(e) => handleInsertRowAt(rows.length, e.target)}
          >
            ${ICONS.plus}
          </button>
        </div>
      </div>
    <//>
  `;
}
