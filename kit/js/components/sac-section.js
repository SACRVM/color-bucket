/**
 * <sac-section title="FILTERS">
 *   …controls…
 * </sac-section>
 *
 * Sidebar group separator: uppercase title + thin underline.
 *
 * Attributes:
 *   title — uppercase heading text. Rendered at --text-muted (real secondary
 *           information, AA on every plane), not the tertiary --text-dim.
 *
 * CSS parts (style from the light DOM, e.g. sac-section::part(title) { … }):
 *   title — the heading.   body — the slotted content wrapper.
 */
class SacSection extends HTMLElement {
    static get observedAttributes() { return ["title"]; }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback()        { this.render(); }
    attributeChangedCallback() { this.render(); }

    render() {
        const title = this.getAttribute("title") || "";
        // Escape: the heading is injected into innerHTML, and an app may set it
        // from dynamic data (a user-named group). Same rule as the rest of the kit.
        const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin-bottom: 1.5rem;
                }
                .title {
                    font-family: 'Outfit', sans-serif;
                    font-size: 0.7rem;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    margin-bottom: 0.75rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid var(--border);
                }
                .body {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
            </style>
            <div class="title" part="title">${esc(title)}</div>
            <div class="body" part="body"><slot></slot></div>
        `;
    }
}

customElements.define("sac-section", SacSection);
