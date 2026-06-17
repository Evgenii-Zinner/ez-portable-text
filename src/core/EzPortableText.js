import { LocalizedSyncEngine } from "./LocalizedSyncEngine.js";
import { deserialize } from "./Deserializer.js";
import { serialize } from "./Serializer.js";
import { RangeManager } from "./RangeManager.js";

/**
 * Main EzPortableText Editor class.
 */
export class EzPortableText {
  /**
   * @param {Object} options - Config options.
   * @param {string|HTMLElement} options.holder - The mount container or element ID.
   * @param {Array} [options.data=[]] - Initial PortableText JSON array.
   * @param {string} [options.theme='dark'] - Editor theme ('light' or 'dark').
   * @param {Object} [options.tools={}] - Key-value pair of custom block plugins.
   * @param {function(Array): void} [options.onChange] - Callback fired on change.
   */
  constructor(options) {
    this.holder =
      typeof options.holder === "string"
        ? document.getElementById(options.holder)
        : options.holder;

    if (!this.holder) {
      throw new Error(`EzPortableText: Holder element not found.`);
    }

    this.data = options.data || [];
    this.theme = options.theme || "dark";
    this.tools = options.tools || {};
    this.onChange = options.onChange;
    this.activeTab = "visual"; // 'visual' | 'json'
    this.debounceTimeout = null;

    this.init();
  }

  /**
   * Initializes the DOM elements, persistent toolbar, and mutation observers.
   * @returns {void}
   */
  init() {
    this.holder.innerHTML = "";
    this.holder.className = `ez-portable-text-container ${this.theme}-theme`;

    // 1. Create Toolbar Header
    this.createToolbar();

    // 2. Create Editor Canvas (Visual View)
    this.canvas = document.createElement("div");
    this.canvas.className = "pe-visual-canvas";
    this.canvas.contentEditable = "true";
    this.canvas.setAttribute("placeholder", "Start typing here...");
    this.holder.appendChild(this.canvas);

    // 3. Create JSON Textarea (JSON View)
    this.jsonTextarea = document.createElement("textarea");
    this.jsonTextarea.className = "pe-json-textarea";
    this.jsonTextarea.style.display = "none";
    this.holder.appendChild(this.jsonTextarea);

    // 4. Create Floating Link Popup
    this.createLinkPopup();

    // Initialize Selection Range Manager
    this.rangeManager = new RangeManager(this.canvas);

    // Initial render from PortableText to DOM
    this.renderDOMFromJSON(this.data);

    // Initialize Localized Sync Engine
    this.syncEngine = new LocalizedSyncEngine(
      this.canvas,
      (key, el) => this.handleBlockUpdate(key, el),
      (key) => this.handleBlockDelete(key),
    );

    this.setupEvents();
    this.setupDebounce();
    this.setupSelectionTracker();
  }

  /**
   * Creates the top formatting toolbar.
   * @returns {void}
   */
  createToolbar() {
    this.toolbar = document.createElement("div");
    this.toolbar.className = "pe-toolbar-wrapper";

    // Format Controls Group
    const controls = document.createElement("div");
    controls.className = "pe-toolbar-controls";

    // Style Select Dropdown (H1, H2, Normal)
    this.styleSelect = document.createElement("select");
    this.styleSelect.className = "pe-style-select";
    const options = [
      { label: "Normal Text", value: "p" },
      { label: "Heading 1", value: "h1" },
      { label: "Heading 2", value: "h2" },
      { label: "Heading 3", value: "h3" },
      { label: "Quote", value: "blockquote" },
    ];
    options.forEach((opt) => {
      const el = document.createElement("option");
      el.value = opt.value;
      el.textContent = opt.label;
      this.styleSelect.appendChild(el);
    });
    controls.appendChild(this.styleSelect);

    // Format buttons
    controls.appendChild(
      this.createToolbarButton("B", "pe-btn-bold", "Bold (Ctrl+B)"),
    );
    controls.appendChild(
      this.createToolbarButton("I", "pe-btn-italic", "Italic (Ctrl+I)"),
    );
    controls.appendChild(
      this.createToolbarButton("U", "pe-btn-underline", "Underline (Ctrl+U)"),
    );
    controls.appendChild(
      this.createToolbarButton("</>", "pe-btn-code", "Inline Code"),
    );
    controls.appendChild(
      this.createToolbarButton("🔗", "pe-btn-link", "Insert Link"),
    );

    this.toolbar.appendChild(controls);

    // Tab Switcher Group
    const tabs = document.createElement("div");
    tabs.className = "pe-toolbar-tabs";

    this.btnVisualTab = document.createElement("button");
    this.btnVisualTab.className = "pe-tab-btn active";
    this.btnVisualTab.textContent = "Editor";
    tabs.appendChild(this.btnVisualTab);

    this.btnJsonTab = document.createElement("button");
    this.btnJsonTab.className = "pe-tab-btn";
    this.btnJsonTab.textContent = "JSON";
    tabs.appendChild(this.btnJsonTab);

    this.toolbar.appendChild(tabs);
    this.holder.appendChild(this.toolbar);
  }

  /**
   * Creates the floating inline popup for link inputs.
   * @returns {void}
   */
  createLinkPopup() {
    this.linkPopup = document.createElement("div");
    this.linkPopup.className = "pe-link-popup";
    this.linkPopup.style.display = "none";

    this.linkInput = document.createElement("input");
    this.linkInput.type = "text";
    this.linkInput.className = "pe-link-input";
    this.linkInput.placeholder = "Paste link URL...";

    const btnSave = document.createElement("button");
    btnSave.className = "pe-link-submit-btn";
    btnSave.textContent = "Apply";

    const btnCancel = document.createElement("button");
    btnCancel.className = "pe-link-cancel-btn";
    btnCancel.textContent = "Cancel";

    this.linkPopup.appendChild(this.linkInput);
    this.linkPopup.appendChild(btnSave);
    this.linkPopup.appendChild(btnCancel);
    this.holder.appendChild(this.linkPopup);

    // Submit Action
    btnSave.addEventListener("click", (e) => {
      e.preventDefault();
      this.applyLinkFormat();
    });

    this.linkInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.applyLinkFormat();
      } else if (e.key === "Escape") {
        this.hideLinkPopup();
      }
    });

    // Cancel Action
    btnCancel.addEventListener("click", (e) => {
      e.preventDefault();
      this.hideLinkPopup();
    });
  }

  /**
   * Creates a button item for the formatting toolbar.
   * @param {string} text - Button display text.
   * @param {string} className - Class name.
   * @param {string} title - Hover description.
   * @returns {HTMLButtonElement} Button element.
   */
  createToolbarButton(text, className, title) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `pe-toolbar-btn ${className}`;
    btn.textContent = text;
    btn.title = title;
    return btn;
  }

  /**
   * Registers format toggles and view tab switches.
   * @returns {void}
   */
  setupEvents() {
    // Toolbar Formatting Actions
    this.toolbar.addEventListener("click", (e) => {
      const btn = e.target.closest(".pe-toolbar-btn");
      if (!btn) return;

      e.preventDefault();
      if (btn.classList.contains("pe-btn-bold")) {
        document.execCommand("bold", false);
      } else if (btn.classList.contains("pe-btn-italic")) {
        document.execCommand("italic", false);
      } else if (btn.classList.contains("pe-btn-underline")) {
        document.execCommand("underline", false);
      } else if (btn.classList.contains("pe-btn-code")) {
        this.applyInlineCodeFormat();
      } else if (btn.classList.contains("pe-btn-link")) {
        this.showLinkPopup();
      }
      this.updateToolbarState();
    });

    // Style Select Dropdown change handler
    this.styleSelect.addEventListener("change", (e) => {
      // Capture keys of all blocks currently intersecting the selection to prevent key regeneration
      const selection = window.getSelection();
      const intersectingKeys = [];
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        Array.from(this.canvas.children).forEach((blockEl) => {
          if (selection.containsNode(blockEl, true)) {
            const key = blockEl.getAttribute("data-block-key");
            if (key) intersectingKeys.push({ el: blockEl, key: key });
          }
        });
      }

      // Restore focus and range so execCommand succeeds
      this.canvas.focus();
      this.rangeManager.restore();
      const tag = e.target.value;

      console.log("[Editor] Applying formatBlock. Target tag:", tag);
      let success = document.execCommand("formatBlock", false, `<${tag}>`);
      console.log("[Editor] execCommand with angle brackets success:", success);

      if (!success) {
        success = document.execCommand("formatBlock", false, tag);
        console.log(
          "[Editor] execCommand without angle brackets success:",
          success,
        );
      }

      // formatBlock often strips attributes (like data-block-key).
      // We must re-attach the preserved keys to the newly generated blocks to prevent the SyncEngine from treating them as brand new.
      if (success) {
        const newSelection = window.getSelection();
        if (newSelection.rangeCount > 0) {
          Array.from(this.canvas.children).forEach((blockEl) => {
            if (
              newSelection.containsNode(blockEl, true) &&
              !blockEl.hasAttribute("data-block-key")
            ) {
              // Find the preserved key that matched this position (simple FIFO mapping for contiguous blocks)
              const preserved = intersectingKeys.shift();
              if (preserved) {
                blockEl.setAttribute("data-block-key", preserved.key);
                console.log(
                  `[Editor] Restored preserved key '${preserved.key}' to new <${blockEl.tagName}> block.`,
                );
              }
            }
          });
        }
      }

      this.updateToolbarState();
    });

    // Tab view toggles
    this.btnVisualTab.addEventListener("click", () => this.switchTab("visual"));
    this.btnJsonTab.addEventListener("click", () => this.switchTab("json"));
  }

  /**
   * Setup a selection tracker listening to cursor shifts.
   * @returns {void}
   */
  setupSelectionTracker() {
    this.selectionListener = () => {
      this.rangeManager.save();
      this.updateToolbarState();
    };
    document.addEventListener("selectionchange", this.selectionListener);
  }

  /**
   * Returns a set of formatting styles active on the current selection's common ancestor.
   * @returns {Set<string>} Set of active formatting styles (e.g. 'strong', 'em', 'underline', 'code', 'link').
   */
  getActiveMarks() {
    const marks = new Set();
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return marks;

    let parent = selection.getRangeAt(0).commonAncestorContainer;
    if (!this.canvas.contains(parent)) return marks;

    if (parent.nodeType === Node.TEXT_NODE) {
      parent = parent.parentNode;
    }

    while (parent && parent !== this.canvas) {
      if (!parent.tagName) break;
      const tag = parent.tagName.toLowerCase();
      if (tag === "strong" || tag === "b") marks.add("strong");
      if (tag === "em" || tag === "i") marks.add("em");
      if (tag === "u") marks.add("underline");
      if (tag === "code") marks.add("code");
      if (tag === "a") marks.add("link");
      parent = parent.parentNode;
    }
    return marks;
  }

  /**
   * Toggles the active status styling class of a toolbar button.
   * @param {string} className - Target button class identifier.
   * @param {boolean} isActive - True if formatting is active.
   * @returns {void}
   */
  toggleButtonActiveState(className, isActive) {
    const btn = this.toolbar.querySelector(`.${className}`);
    if (btn) {
      if (isActive) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    }
  }

  /**
   * Scans active text highlights and updates formatting controls to match styles.
   * @returns {void}
   */
  updateToolbarState() {
    if (this.activeTab !== "visual") return;

    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    let parent = range.commonAncestorContainer;
    if (!this.canvas.contains(parent)) return;

    if (parent.nodeType === Node.TEXT_NODE) {
      parent = parent.parentNode;
    }

    // 1. Sync Style Select Dropdown
    const blockEl = parent.closest("[data-block-key]");
    if (blockEl && this.canvas.contains(blockEl)) {
      const tag = blockEl.tagName.toLowerCase();
      if (["p", "h1", "h2", "h3", "blockquote"].includes(tag)) {
        this.styleSelect.value = tag;
      }
    }

    // 2. Sync Inline Format buttons active states
    const marks = this.getActiveMarks();
    this.toggleButtonActiveState(
      "pe-btn-bold",
      marks.has("strong") || document.queryCommandState("bold"),
    );
    this.toggleButtonActiveState(
      "pe-btn-italic",
      marks.has("em") || document.queryCommandState("italic"),
    );
    this.toggleButtonActiveState(
      "pe-btn-underline",
      marks.has("underline") || document.queryCommandState("underline"),
    );
    this.toggleButtonActiveState("pe-btn-code", marks.has("code"));
    this.toggleButtonActiveState("pe-btn-link", marks.has("link"));
  }

  /**
   * Formats the current selection with inline code formatting, or unwraps it if already active.
   * Toggles the code mark style on or off, ensuring that inner code marks are cleaned up to prevent stacking.
   * @returns {void}
   */
  applyInlineCodeFormat() {
    const selection = window.getSelection();
    if (selection.rangeCount === 0 || selection.isCollapsed) return;
    const range = selection.getRangeAt(0);

    let parent = range.commonAncestorContainer;
    if (parent.nodeType === Node.TEXT_NODE) {
      parent = parent.parentNode;
    }

    const codeEl = parent.closest("code");
    if (codeEl && this.canvas.contains(codeEl)) {
      // Toggle OFF: Unwrap existing <code> tag
      const parentNode = codeEl.parentNode;
      while (codeEl.firstChild) {
        parentNode.insertBefore(codeEl.firstChild, codeEl);
      }
      parentNode.removeChild(codeEl);
      this.triggerChange();
      return;
    }

    const fragment = range.cloneContents();
    const innerCodes = fragment.querySelectorAll("code");
    if (innerCodes.length > 0) {
      // Toggle OFF: Selection contains code tags, unwrap them
      const div = document.createElement("div");
      div.appendChild(fragment);
      div.querySelectorAll("code").forEach((c) => {
        const frag = document.createDocumentFragment();
        while (c.firstChild) frag.appendChild(c.firstChild);
        c.parentNode.replaceChild(frag, c);
      });
      document.execCommand("insertHTML", false, div.innerHTML);
      this.triggerChange();
      return;
    }

    // Toggle ON: Wrap in <code>
    const code = document.createElement("code");
    try {
      range.surroundContents(code);
    } catch (err) {
      const div = document.createElement("div");
      div.appendChild(range.cloneContents());
      document.execCommand(
        "insertHTML",
        false,
        `<code>${div.innerHTML}</code>`,
      );
    }
    this.triggerChange();
  }

  /**
   * Displays the link input popup positioned directly above the text selection, toggling it off if already present.
   * @returns {void}
   */
  showLinkPopup() {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    let parent = selection.getRangeAt(0).commonAncestorContainer;
    if (parent.nodeType === Node.TEXT_NODE) {
      parent = parent.parentNode;
    }

    const linkEl = parent.closest("a");
    if (linkEl && this.canvas.contains(linkEl)) {
      // Toggle OFF: remove link
      document.execCommand("unlink", false);
      this.triggerChange();
      return;
    }

    const saved = this.rangeManager.save();
    if (!saved) return;
    if (selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const holderRect = this.holder.getBoundingClientRect();

    // Position popup centered right above the active highlight selection
    this.linkPopup.style.left = `${rect.left - holderRect.left + rect.width / 2 - 130}px`;
    this.linkPopup.style.top = `${rect.top - holderRect.top - 45}px`;
    this.linkPopup.style.display = "flex";

    // Reset input and focus
    this.linkInput.value = "";
    this.linkInput.focus();
  }

  /**
   * Closes the link input popup.
   * @returns {void}
   */
  hideLinkPopup() {
    this.linkPopup.style.display = "none";
    this.rangeManager.restore();
  }

  /**
   * Applies the anchor hyperlink wrap to the cached text range selection.
   * @returns {void}
   */
  applyLinkFormat() {
    const url = this.linkInput.value;
    const sanitized = this.sanitizeHref(url);

    this.rangeManager.restore();
    if (sanitized) {
      document.execCommand("createLink", false, sanitized);
    }

    this.linkPopup.style.display = "none";
    this.linkInput.value = "";
  }

  /**
   * Verifies link protocol safety.
   * @param {string} url - User input target URL.
   * @returns {string} Sanitized destination link.
   */
  sanitizeHref(url) {
    if (!url) return "";
    const trimmed = url.trim();
    const safeProtocol = /^(https?|mailto|tel|\/|#|internal:)/i;
    return safeProtocol.test(trimmed) ? trimmed : "#invalid-link";
  }

  /**
   * Setup debouncing change listener for visual canvas editor inputs.
   * @returns {void}
   */
  setupDebounce() {
    this.canvas.addEventListener("input", () => {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        const ptData = serialize(this.canvas);
        this.data = ptData;
        this.triggerChange();
      }, 300);
    });
  }

  /**
   * Swaps between visual editing and clean JSON panel views.
   * @param {string} tab - Mode value ('visual' | 'json').
   * @returns {void}
   */
  switchTab(tab) {
    if (this.activeTab === tab) return;

    if (tab === "visual") {
      try {
        const newData = JSON.parse(this.jsonTextarea.value);
        this.updateFromJSON(newData);
        this.jsonTextarea.style.display = "none";
        this.canvas.style.display = "block";
        this.styleSelect.removeAttribute("disabled");
        this.btnVisualTab.classList.add("active");
        this.btnJsonTab.classList.remove("active");
        this.activeTab = "visual";
      } catch (err) {
        alert("Invalid PortableText JSON: " + err.message);
      }
    } else {
      this.data = serialize(this.canvas);
      this.jsonTextarea.value = JSON.stringify(this.data, null, 2);
      this.canvas.style.display = "none";
      this.jsonTextarea.style.display = "block";
      this.styleSelect.setAttribute("disabled", "true");
      this.btnJsonTab.classList.add("active");
      this.btnVisualTab.classList.remove("active");
      this.activeTab = "json";
    }
  }

  /**
   * Re-builds visual DOM elements from a PortableText JSON array.
   * @param {Array} data - PortableText array.
   * @returns {void}
   */
  renderDOMFromJSON(data) {
    deserialize(data, this.canvas);
  }

  /**
   * Handles individual block updates during mutations.
   * @param {string} key - Block key identifier.
   * @param {HTMLElement} element - Updated block element.
   * @returns {void}
   */
  handleBlockUpdate(key, element) {
    const ptData = serialize(this.canvas);
    this.data = ptData;
    this.triggerChange();
  }

  /**
   * Handles deletion of blocks from the canvas.
   * @param {string} key - Block key identifier.
   * @returns {void}
   */
  handleBlockDelete(key) {
    const ptData = serialize(this.canvas);
    this.data = ptData;
    this.triggerChange();
  }

  /**
   * Updates editor state and canvas directly from an external JSON array.
   * @param {Array} json - PortableText JSON array.
   * @returns {void}
   */
  updateFromJSON(json) {
    this.data = json;
    this.renderDOMFromJSON(this.data);
    this.triggerChange();
  }

  /**
   * Fires the client onChange callback with current PortableText array.
   * @returns {void}
   */
  triggerChange() {
    if (this.onChange) {
      this.onChange(this.data);
    }
  }

  /**
   * Disconnects observers and releases references.
   * @returns {void}
   */
  destroy() {
    if (this.syncEngine) {
      this.syncEngine.disconnect();
    }
    document.removeEventListener("selectionchange", this.selectionListener);
    clearTimeout(this.debounceTimeout);
    this.holder.innerHTML = "";
  }
}
