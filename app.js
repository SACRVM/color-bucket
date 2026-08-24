/**
 * <app-color-bucket> — mix colors like paint, not like numbers.
 *
 * Pigment mixing is spectral Kubelka-Munk over 38 wavelength bands
 * (spectral.js, MIT, © 2025 Ronald van Wijnen). The point of the app is the
 * paint pots: a raw color picker is the problem this solves, so every shelf is
 * a ready-made box you can start from without picking anything.
 *
 * THE SCRIPTS ARE LOADED BY THE APP ITSELF. sac.app has styles() but no script
 * loader, and a desktop only ever fetches `entry` from the manifest — so
 * index.html cannot be where spectral.js comes from. The app injects it, along
 * with lib/harmony.js, and defines its tag once they are there; elements
 * already in the DOM upgrade on define, so defining late is safe.
 */
(function () {
    "use strict";

    // Parse time, top level: document.currentScript is this file only here.
    const BASE = sac.app.base();

    /* ------------------------------------------------------------ shelves --
       Every shelf is a paint box of ready-made pots. Boxes of 16 like a real
       paint box, except where the source palette is genuinely smaller. */
    const SHELVES = [
        { id: "oils", label: "Oils", pots: [
            { name: "Titanium White", c: "#F5F3EE" }, { name: "Lemon Yellow", c: "#F1E04E" },
            { name: "Cadmium Yellow", c: "#F2C500" }, { name: "Cadmium Orange", c: "#E8731A" },
            { name: "Cadmium Red", c: "#D93A2B" }, { name: "Alizarin Crimson", c: "#9E2B3B" },
            { name: "Quinacridone Magenta", c: "#B93A86" }, { name: "Dioxazine Violet", c: "#4F3480" },
            { name: "Ultramarine Blue", c: "#1F3A93" }, { name: "Phthalo Blue", c: "#0C5DA5" },
            { name: "Phthalo Green", c: "#0A6B52" }, { name: "Sap Green", c: "#59782E" },
            { name: "Yellow Ochre", c: "#C08A2E" }, { name: "Burnt Sienna", c: "#8C4520" },
            { name: "Burnt Umber", c: "#5A3A28" }, { name: "Ivory Black", c: "#23211C" },
        ] },
        { id: "earths", label: "Earths", pots: [
            { name: "Chalk White", c: "#EAE6DA" }, { name: "Lead-Tin Yellow", c: "#E0C468" },
            { name: "Yellow Ochre", c: "#C08A2E" }, { name: "Raw Sienna", c: "#B57F3C" },
            { name: "Red Ochre", c: "#96422A" }, { name: "Venetian Red", c: "#AE4A2E" },
            { name: "Madder Lake", c: "#8E3B4A" }, { name: "Burnt Sienna", c: "#8C4520" },
            { name: "Raw Umber", c: "#705B3B" }, { name: "Burnt Umber", c: "#5A3A28" },
            { name: "Green Earth", c: "#6B7B5A" }, { name: "Olive Earth", c: "#6A6239" },
            { name: "Lapis Lazuli", c: "#33518E" }, { name: "Indigo", c: "#2E4057" },
            { name: "Charcoal", c: "#38352F" }, { name: "Bone Black", c: "#26221E" },
        ] },
        { id: "crayons", label: "Crayons", pots: [
            { name: "White", c: "#F4F2EC" }, { name: "Yellow", c: "#FBE24D" },
            { name: "Yellow-Orange", c: "#F9A63C" }, { name: "Orange", c: "#F58230" },
            { name: "Red-Orange", c: "#ED5B35" }, { name: "Red", c: "#E23B36" },
            { name: "Pink", c: "#F8A9C4" }, { name: "Red-Violet", c: "#C0448F" },
            { name: "Violet", c: "#8E4FA8" }, { name: "Blue-Violet", c: "#6E5BC0" },
            { name: "Blue", c: "#2C6BD9" }, { name: "Blue-Green", c: "#159FB8" },
            { name: "Green", c: "#2FA457" }, { name: "Yellow-Green", c: "#9FC54C" },
            { name: "Brown", c: "#A2593B" }, { name: "Black", c: "#262424" },
        ] },
        { id: "c64", label: "C64", pots: [
            { name: "Black", c: "#000000" }, { name: "White", c: "#FFFFFF" },
            { name: "Red", c: "#68372B" }, { name: "Cyan", c: "#70A4B2" },
            { name: "Purple", c: "#6F3D86" }, { name: "Green", c: "#588D43" },
            { name: "Blue", c: "#352879" }, { name: "Yellow", c: "#B8C76F" },
            { name: "Orange", c: "#6F4F25" }, { name: "Brown", c: "#433900" },
            { name: "Light Red", c: "#9A6759" }, { name: "Dark Gray", c: "#444444" },
            { name: "Gray", c: "#6C6C6C" }, { name: "Light Green", c: "#9AD284" },
            { name: "Light Blue", c: "#6C5EB5" }, { name: "Light Gray", c: "#959595" },
        ] },
        { id: "pico8", label: "PICO-8", pots: [
            { name: "Black", c: "#000000" }, { name: "Dark Blue", c: "#1D2B53" },
            { name: "Dark Purple", c: "#7E2553" }, { name: "Dark Green", c: "#008751" },
            { name: "Brown", c: "#AB5236" }, { name: "Dark Gray", c: "#5F574F" },
            { name: "Light Gray", c: "#C2C3C7" }, { name: "White", c: "#FFF1E8" },
            { name: "Red", c: "#FF004D" }, { name: "Orange", c: "#FFA300" },
            { name: "Yellow", c: "#FFEC27" }, { name: "Green", c: "#00E436" },
            { name: "Blue", c: "#29ADFF" }, { name: "Lavender", c: "#83769C" },
            { name: "Pink", c: "#FF77A8" }, { name: "Peach", c: "#FFCCAA" },
        ] },
        { id: "web", label: "Web", pots: [
            { name: "Black", c: "#000000" }, { name: "Silver", c: "#C0C0C0" },
            { name: "Gray", c: "#808080" }, { name: "White", c: "#FFFFFF" },
            { name: "Maroon", c: "#800000" }, { name: "Red", c: "#FF0000" },
            { name: "Purple", c: "#800080" }, { name: "Fuchsia", c: "#FF00FF" },
            { name: "Green", c: "#008000" }, { name: "Lime", c: "#00FF00" },
            { name: "Olive", c: "#808000" }, { name: "Yellow", c: "#FFFF00" },
            { name: "Navy", c: "#000080" }, { name: "Blue", c: "#0000FF" },
            { name: "Teal", c: "#008080" }, { name: "Aqua", c: "#00FFFF" },
        ] },
        { id: "db16", label: "DB16", pots: [
            { name: "Void", c: "#140C1C" }, { name: "Plum", c: "#442434" },
            { name: "Navy", c: "#30346D" }, { name: "Slate", c: "#4E4A4E" },
            { name: "Brown", c: "#854C30" }, { name: "Forest", c: "#346524" },
            { name: "Scarlet", c: "#D04648" }, { name: "Ash", c: "#757161" },
            { name: "Cornflower", c: "#597DCE" }, { name: "Amber", c: "#D27D2C" },
            { name: "Steel", c: "#8595A1" }, { name: "Leaf", c: "#6DAA2C" },
            { name: "Tan", c: "#D2AA99" }, { name: "Sky", c: "#6DC2CA" },
            { name: "Lemon", c: "#DAD45E" }, { name: "Cream", c: "#DEEED6" },
        ] },
        { id: "gameboy", label: "Game Boy", pots: [
            { name: "Darkest Green", c: "#0F380F" }, { name: "Dark Green", c: "#306230" },
            { name: "Light Green", c: "#8BAC0F" }, { name: "Lightest Green", c: "#9BBC0F" },
        ] },
        { id: "zorn", label: "Zorn", pots: [
            { name: "Flake White", c: "#F2EEE3" }, { name: "Yellow Ochre", c: "#C08A2E" },
            { name: "Vermilion", c: "#D8432F" }, { name: "Ivory Black", c: "#23211C" },
        ] },
        { id: "skin", label: "Skin", pots: [
            { name: "Porcelain", c: "#F7E3D4" }, { name: "Ivory", c: "#F2D5BC" },
            { name: "Warm Ivory", c: "#EDC5A8" }, { name: "Sand", c: "#E7B592" },
            { name: "Beige", c: "#DEA57F" }, { name: "Honey", c: "#D2946C" },
            { name: "Amber", c: "#C6875F" }, { name: "Caramel", c: "#B97951" },
            { name: "Bronze", c: "#A96A45" }, { name: "Chestnut", c: "#9A5B3A" },
            { name: "Sienna", c: "#8B4F31" }, { name: "Cocoa", c: "#7A452B" },
            { name: "Mahogany", c: "#693A24" }, { name: "Espresso", c: "#57301E" },
            { name: "Truffle", c: "#452619" }, { name: "Onyx", c: "#331D14" },
        ] },
        // RAL values are common sRGB approximations. "RAL" is a trademark of
        // RAL gGmbH; if this shelf keeps the name the product needs a note.
        { id: "ral", label: "RAL",
          note: "“RAL” is a registered trademark of RAL gGmbH, which is not " +
                "affiliated with this app and does not endorse it. These values " +
                "are common sRGB approximations of the classic collection, not " +
                "colour standards — match a physical fan deck, never a screen.",
          pots: [
            { name: "Cream 9001", c: "#FDF4E3" }, { name: "Light Ivory 1015", c: "#EAE6CA" },
            { name: "Signal Yellow 1003", c: "#F7BA0B" }, { name: "Pure Orange 2004", c: "#E75B12" },
            { name: "Traffic Red 3020", c: "#C1121C" }, { name: "Ruby Red 3003", c: "#9B111E" },
            { name: "Signal Violet 4008", c: "#924E7D" }, { name: "Gentian Blue 5010", c: "#0E294B" },
            { name: "Sky Blue 5015", c: "#2271B3" }, { name: "Turquoise Blue 5018", c: "#3F888F" },
            { name: "Emerald Green 6001", c: "#287233" }, { name: "May Green 6017", c: "#4C9141" },
            { name: "Ochre Yellow 1024", c: "#BA8F4C" }, { name: "Nut Brown 8011", c: "#5B3A29" },
            { name: "Silver Grey 7001", c: "#8A9597" }, { name: "Jet Black 9005", c: "#0A0A0A" },
        ] },
    ];

    const shelfById = (id) => SHELVES.filter((s) => s.id === id)[0];
    /* The ceiling on a recipe's parts. 256 rather than a round 99 because a
       glaze is a real thing — one part pigment in 256 parts white — and the
       harmony ramp's light and dark ends are exactly that. Cap it lower and a
       generated ramp step could not be reproduced in the mixer that shows it.
       lib/harmony.js carries the same number as MAX_PARTS. */
    const MAX_PARTS = 256;

    /* Dragging a generated swatch into the palette carries the whole entry,
       not the colour: a dropped hex would throw away the recipe and the name
       the generator just worked out. A private MIME type rather than
       text/plain, because dragover may only inspect the TYPES — it is not
       allowed to read the data — and that is what decides whether the palette
       accepts the drop at all. text/plain rides along so a drag out of the app
       still means something. */
    const DRAG_TYPE = "application/x-color-bucket-entry";

    /* What a swatch says when you point at it. One shape everywhere —
       name · hex · what it is made of — so the pots, the palette and the
       generated colours read as the same kind of thing.

       This is the `label` a sac-swatch turns into its native title AND its
       accessible name, which is why it is written as a sentence rather than
       as a badge: it has to survive being read aloud. The kit's own bubble
       cannot be used here — sac-tooltip wraps its trigger, and a wrapped
       swatch stops being a child of its grid — so the native tooltip is what
       there is. Reported; the shape below is ours either way. */
    /* A colour that is not on any shelf has no name to give — it is a mix.
       "Custom" is the right word for a recipe ROW, where you are about to edit
       it; in a one-line hover text it says nothing, and the hex says what the
       thing actually is. */
    const bucketName = (hex) => {
        const n = potName(hex);
        return n === "Custom" ? hex.toUpperCase() : n;
    };
    const recipeText = (buckets) =>
        buckets.map((b) => b.w).join(":") + " " + buckets.map((b) => bucketName(b.c)).join(" · ");

    function swatchTitle(name, hex, buckets) {
        const parts = [];
        if (name) parts.push(name);
        parts.push(hex.toUpperCase());
        /* The recipe joins only when it adds something. One pot mixed with
           itself is not a recipe, and an all-equal blend is already spelled
           out by its name — "Cadmium Yellow + Ultramarine Blue · 1:1 Cadmium
           Yellow · Ultramarine Blue" says everything twice. What earns the
           space is an uneven ratio, which is exactly what a ramp step is. */
        if (buckets && buckets.length > 1 && buckets.some((b) => b.w !== buckets[0].w)) {
            parts.push(recipeText(buckets));
        }
        return parts.join(" · ");
    }

    function potName(hex) {
        hex = hex.toUpperCase();
        for (const s of SHELVES) for (const p of s.pots) if (p.c === hex) return p.name;
        return "Custom";
    }

    /* ------------------------------------------------------------- color ---
       sac.color is the kit's colour math and the app uses nothing else for it.
       parse/format/luma/onColor all lived here as private copies once, down to
       the same 0.35 ink-flip threshold the kit had already picked and written
       down. A rounding rule or a parsing tolerance belongs in one place. */
    const rgbOf = (hex) => sac.color.parse(hex) || { r: 0, g: 0, b: 0, a: 1 };
    const hexOf = (rgb) => sac.color.format(rgb).toUpperCase();
    const inkOn = (hex) => sac.color.onColor(rgbOf(hex));
    const lumaOf = (hex) => sac.color.luma(rgbOf(hex));

    /* The pots a shelf tints and shades with. Derived, not declared: several
       shelves have no white at all (Game Boy is four greens), and a shelf that
       gains a pot should not need a second edit somewhere else to stay right. */
    function shelfEnds(id) {
        const pots = shelfById(id).pots;
        let light = pots[0], dark = pots[0];
        for (const p of pots) {
            if (lumaOf(p.c) > lumaOf(light.c)) light = p;
            if (lumaOf(p.c) < lumaOf(dark.c)) dark = p;
        }
        return { white: light.c, dark: dark.c };
    }

    // spectral.Color objects are memoized per hex — the measured fast path,
    // ~467k mixes/s. Parts pass as sqrt(w): spectral.js squares its factors
    // internally, so this is what keeps "3 parts" meaning 3 parts.
    const colorCache = Object.create(null);
    const spectralColor = (hex) => {
        hex = hex.toUpperCase();
        return colorCache[hex] || (colorCache[hex] = new spectral.Color(hex));
    };
    const mixPigment = (bs) =>
        spectral.mix(...bs.map((b) => [spectralColor(b.c), Math.sqrt(b.w)])).toString().toUpperCase();
    function mixRGB(bs) {
        const tw = bs.reduce((a, b) => a + b.w, 0) || 1;
        const out = { r: 0, g: 0, b: 0 };
        for (const b of bs) {
            const c = rgbOf(b.c);
            out.r += c.r * (b.w / tw); out.g += c.g * (b.w / tw); out.b += c.b * (b.w / tw);
        }
        return hexOf(out);
    }

    /* ------------------------------------------------------------ recipe ---
       The whole recipe is shareable state: "<hex>x<parts>,…;<mode>;<shelf>".
       It travels as the app's route, so it works the same standalone and
       installed — on a desktop the host puts it under "#/color-bucket/". */
    const encodeRecipe = (buckets, mode, shelf) =>
        buckets.map((b) => b.c.slice(1) + "x" + b.w).join(",") + ";" + mode + ";" + shelf;

    function decodeRecipe(route) {
        if (!route) return null;
        try {
            const parts = String(route).replace(/^\/+|\/+$/g, "").split(";");
            const bs = parts[0].split(",").map((t) => {
                const m = t.match(/^([0-9A-Fa-f]{6})x(\d+)$/);
                return m ? { c: "#" + m[1].toUpperCase(), w: Math.min(MAX_PARTS, Math.max(1, parseInt(m[2], 10))) } : null;
            });
            if (!bs.length || !bs.every(Boolean)) return null;
            return {
                buckets: bs,
                mode: parts[1] === "rgb" ? "rgb" : "pigment",
                shelf: parts[2] && shelfById(parts[2]) ? parts[2] : "oils",
            };
        } catch (e) { return null; }
    }

    class AppColorBucket extends sac.app.Element {
        /** Once, on first connect. Light DOM, so the kit's components and its
            stylesheet both reach the markup. */
        build() {
            sac.app.styles(BASE + "app.css", "app-color-bucket-css");

            this.buckets = [{ c: "#F2C500", w: 3 }, { c: "#1F3A93", w: 1 }];
            this.mode = "pigment";
            this.shelf = "oils";
            this.palette = [];
            this._rows = [];
            this._filled = Object.create(null);
            // One undo stack over recipe AND palette — an accidental delete
            // deserves the same rescue as a wrong dab.
            this._history = [];
            this._hi = -1;
            this._sel = -1;              // index of the selected palette entry
            /* context.fs is asynchronous, so between mount and the palette
               arriving the app holds an EMPTY palette that is not the truth.
               Nothing may be recorded or written in that window: a history
               floor laid there has an empty palette in it, and one undo would
               then persist the emptiness over the file that was still being
               read. Every gate below hangs off this flag. */
            this._loaded = false;

            /* One tab and one panel per shelf. The kit never re-renders a
               panel — switching is two attribute flips — so a shelf keeps its
               grid for the whole session. */
            const tabs = SHELVES.map((s) =>
                `<sac-tab name="${s.id}">${s.label}</sac-tab>`).join("");
            const panels = SHELVES.map((s) =>
                `<sac-tab-panel name="${s.id}">` +
                `<sac-swatch-grid columns="8" data-shelf="${s.id}"></sac-swatch-grid>` +
                `</sac-tab-panel>`).join("");

            this.innerHTML = `
                <sac-nav app-name="COLOR BUCKET" brand-icon="palette">
                    <div slot="toolbar" class="toolbar">
                        <button type="button" class="nav-icon-btn cb-undo" title="Undo" aria-label="Undo" disabled>
                            <sac-icon name="undo"></sac-icon></button>
                        <button type="button" class="nav-icon-btn cb-redo" title="Redo" aria-label="Redo" disabled>
                            <sac-icon name="redo"></sac-icon></button>
                        <span class="cb-tsep" aria-hidden="true"></span>
                        <button type="button" class="nav-icon-btn cb-file-save" title="Download the palette as JSON" aria-label="Download the palette">
                            <sac-icon name="download"></sac-icon></button>
                        <button type="button" class="nav-icon-btn cb-file-load" title="Load a palette from JSON" aria-label="Load a palette">
                            <sac-icon name="upload"></sac-icon></button>
                        <span class="cb-tsep" aria-hidden="true"></span>
                        <button type="button" class="nav-icon-btn cb-about" title="Credits &amp; licences" aria-label="Credits and licences">
                            <sac-icon name="copyright"></sac-icon></button>
                    </div>
                </sac-nav>

                <div class="main-layout cb-stage">
                    <aside class="sidebar cb-side">
                        <sac-section title="Paint pots">
                            <!-- overflow="scroll": the shelf strip stays ONE
                                 row and pans — wheel over the strip, ‹ › at the
                                 ends, and never a scrollbar (the kit's own
                                 rule). It also pans the active tab into view
                                 on every active change, so a shared recipe
                                 cannot select a shelf nobody can see. Eleven
                                 labels are ~700px against ~318px of sidebar,
                                 so the strip is permanently overflowing —
                                 that is the price of one row, not a defect. -->
                            <sac-tab-group class="cb-shelves" overflow="scroll" active="${this.shelf}">
                                ${tabs}${panels}
                            </sac-tab-group>
                            <sac-status-banner class="cb-shelf-note"></sac-status-banner>
                        </sac-section>

                        <sac-section title="Recipe">
                            <div class="cb-rows"></div>
                            <button type="button" class="btn cb-add">+ Custom color</button>
                        </sac-section>

                        <sac-section title="Mixing mode">
                            <sac-segmented-control class="cb-mode" value="${this.mode}">
                                <button data-value="pigment">Pigment</button>
                                <button data-value="rgb">RGB</button>
                            </sac-segmented-control>
                        </sac-section>

                        <sac-section title="Palette">
                            <!-- The palette's own controls sit with the palette,
                                 not in the ribbon: they act on ONE colour, and
                                 the ribbon carries what acts on the whole app.
                                 .toolbar is the kit's documented button strip —
                                 it shrinks .btn to the 32px recipe by itself. -->
                            <div class="toolbar cb-pal-bar">
                                <button type="button" class="btn cb-pal-new" title="Start a new, empty palette" aria-label="Start a new, empty palette">
                                    <sac-icon name="document"></sac-icon></button>
                                <span class="cb-tsep" aria-hidden="true"></span>
                                <button type="button" class="btn cb-pal-add" title="New colour" aria-label="New colour">
                                    <sac-icon name="plus"></sac-icon></button>
                                <button type="button" class="btn cb-pal-dup" title="Duplicate the selected colour" aria-label="Duplicate the selected colour" disabled>
                                    <sac-icon name="copy"></sac-icon></button>
                                <button type="button" class="btn cb-pal-del" title="Delete the selected colour" aria-label="Delete the selected colour" disabled>
                                    <sac-icon name="trash"></sac-icon></button>
                                <!-- Where commands collect instead of growing
                                     another button each. A menu costs one slot
                                     however many entries it holds; a button
                                     strip costs a slot per entry, and the fat
                                     "Copy all hex values" bar that used to sit
                                     under the palette was the first instalment
                                     of that bill. -->
                                <sac-menu class="cb-pal-menu">
                                    <button slot="trigger" type="button" class="btn cb-pal-more" title="More palette commands" aria-label="More palette commands">
                                        <sac-icon name="menu"></sac-icon></button>
                                    <button data-action="copy-hex"><sac-icon name="copy"></sac-icon> Copy all hex values</button>
                                    <button data-action="copy-css"><sac-icon name="document"></sac-icon> Copy as CSS</button>
                                </sac-menu>
                            </div>
                            <!-- selectable: the kit draws the 2px accent outline and runs the
                                 keyboard navigation. Selecting is what arms the
                                 palette buttons in the ribbon; the grid itself is
                                 drawn exactly as before. -->
                            <sac-swatch-grid class="cb-pal-grid" columns="6" selectable hidden></sac-swatch-grid>
                        </sac-section>

                    </aside>

                    <main class="cb-result" aria-live="polite">
                        <p class="cb-result-name">Your mix</p>
                        <h1 class="cb-hex">#000000</h1>
                        <div class="cb-actions">
                            <button type="button" class="btn cb-copy-hex">Copy hex</button>
                        </div>
                        <div class="cb-compare">
                            <sac-swatch class="cb-cmp-chip"></sac-swatch>
                            <span class="cb-cmp-text"></span>
                        </div>
                        <section class="cb-harmony" hidden>
                            <p class="cb-harm-title">A palette from these pigments</p>
                            <sac-swatch-grid class="cb-harm-hues" columns="10"></sac-swatch-grid>
                            <sac-swatch-grid class="cb-harm-neutrals" columns="10"></sac-swatch-grid>
                            <p class="cb-harm-foot">
                                <span class="cb-harm-why"></span>
                                <button type="button" class="btn cb-harm-add">Add all to palette</button>
                            </p>
                        </section>
                    </main>
                </div>

                <!-- The kit's file intake, used for its plumbing rather than
                     its surface: browse() opens the picker and sac:files
                     carries the result, including the fix for the classic
                     "pick the same file twice" trap. Kept off screen (not
                     hidden — a display:none subtree can swallow the picker
                     click) because the ribbon button is the way in. -->
                <sac-drop-zone class="cb-file" accept="application/json,.json"
                               label="" hint=""></sac-drop-zone>`;

            this._nav = this.q("sac-nav");
        }

        /** Once, when the app is really on screen. */
        onMount(context) {
            this._ctx = context;

            /* The one line of the app contract that makes the ribbon the
               HOST's as well as ours: jump-home, the suite's burger entries
               and its own toolbar controls are all rendered by this nav from
               the data the host supplies. Standalone context.host is null and
               none of it renders. */
            this._nav.host = context.host;
            this._nav.setAttribute("brand-href", context.href(""));

            const restored = decodeRecipe(context.route);
            if (restored) { this.buckets = restored.buckets; this.mode = restored.mode; this.shelf = restored.shelf; }

            this.q(".cb-shelves").setAttribute("active", this.shelf);
            this.fillShelf(this.shelf);
            this.buildRows();
            this.showNote();

            /* A pot is not a selection, it is a dab: tapping the same pot again
               has to add another part. sac-swatch-grid's selectable mode fires
               only when the chosen swatch CHANGES — the right contract for a
               picker and the wrong one here — so the grid stays plain and the
               click is read off the light-DOM <sac-swatch>. */
            this.q(".cb-shelves").addEventListener("click", (e) => {
                const sw = e.target.closest("sac-swatch");
                if (!sw || !this.contains(sw)) return;
                const hex = String(sw.getAttribute("value") || "").toUpperCase();
                const hit = this.buckets.filter((x) => x.c.toUpperCase() === hex)[0];
                if (hit) { if (hit.w < MAX_PARTS) { hit.w++; this.refresh(); this.commit(); } }
                else { this.buckets.push({ c: hex, w: 1 }); this.buildRows(); this.refresh(); this.commit(); }
            });

            this.q(".cb-shelves").addEventListener("sac:tab-show", (e) => {
                this.shelf = e.detail.name;
                this.fillShelf(this.shelf);
                this.showNote();
                this.refresh();
                this.commit();
            });

            // Kit 2.0.0 unified value events: a kit component emits sac:change
            // with detail { value }, never a native `change`, and the value is
            // no longer the detail itself.
            this.q(".cb-mode").addEventListener("sac:change", (e) => {
                this.setMode(e.detail.value);
                this.commit();
            });

            this.q(".cb-add").addEventListener("click", () => {
                this.buckets.push({ c: "#D0342C", w: 1 });
                this.buildRows(); this.refresh(); this.commit();
            });
            this.q(".cb-copy-hex").addEventListener("click", () => this.copy(this.q(".cb-hex").textContent));
            this.q(".cb-pal-menu").addEventListener("sac:select", (e) => {
                if (e.detail.action === "copy-hex") {
                    this.copyRaw(this.palette.map((x) => x.hex).join(", "),
                        "Copied " + this.palette.length + " hex values");
                } else if (e.detail.action === "copy-css") {
                    if (!window.cbHarmony) return;
                    this.copyRaw(cbHarmony.paletteToCSS(this.palette),
                        "Copied the palette as CSS custom properties");
                }
            });

            /* The ribbon is the app's own markup now. 2.0.0 moved chrome
               ownership to the app and dropped the sac.toolbar projection
               that used to stand here — a guarded call to it ran silently
               into nothing and the About button simply vanished. */
            /* Never render a control that does nothing — the kit's own rule,
               and the one this app filed against sac-nav's empty burger. On a
               host whose kit predates sac.about there is no About to open, so
               there is no button either. */
            if (sac.about) this.q(".cb-about").addEventListener("click", () => this.showAbout());
            else this.q(".cb-about").hidden = true;
            this.q(".cb-undo").addEventListener("click", () => this.undo());
            this.q(".cb-redo").addEventListener("click", () => this.redo());
            this.q(".cb-file-save").addEventListener("click", () => this.savePaletteFile());
            this.q(".cb-file-load").addEventListener("click", () => this.q(".cb-file").browse());
            this.q(".cb-file").addEventListener("sac:files", (e) => {
                const file = e.detail.files[0];
                if (file) this.loadPaletteFile(file);
            });

            /* ---- the palette --------------------------------------------
               Choosing a colour OPENS it: its recipe goes straight into the
               mixer, and from then on every change to that recipe is written
               back into the entry. The palette colour is the document, the
               recipe panel is its editor — there is no separate save step to
               forget. */
            const pal = this.q(".cb-pal-grid");
            pal.addEventListener("sac:change", (e) => {
                this._sel = Array.prototype.indexOf.call(pal.children, e.detail.swatch);
                this.syncPaletteButtons();
                const entry = this.palette[this._sel];
                if (entry) this.loadEntry(entry);
            });

            this.q(".cb-pal-new").addEventListener("click", async () => {
                if (this.palette.length && typeof sac.dialog === "object") {
                    const answer = await sac.dialog.confirm({
                        title: "Start a new palette?",
                        message: "The " + this.palette.length + " colours in this palette will be "
                               + "cleared. Undo brings them back, and Download keeps them for good.",
                        buttons: [
                            { action: "cancel", label: "Cancel", kind: "default" },
                            { action: "clear", label: "New palette", kind: "destructive" },
                        ],
                    });
                    if (answer !== "clear") return;
                }
                this.palette = [this.freshEntry()];
                this.selectEntry(0);
            });

            /* There is no "save" step, because there is nothing to save: what
               the mixer shows is already a palette colour and follows every
               change. So this button does not capture anything — it starts a
               BLANK one and hands the mixer over to it. Forking the colour you
               are on is the other button, next to it. */
            this.q(".cb-pal-add").addEventListener("click", () => {
                this.palette.push(this.freshEntry());
                this.selectEntry(this.palette.length - 1);
            });

            this.q(".cb-pal-dup").addEventListener("click", () => {
                const entry = this.palette[this._sel];
                if (!entry) return;
                // The copy is what stays selected, so editing right after
                // duplicating varies the copy and leaves the original alone.
                this.palette.splice(this._sel + 1, 0, JSON.parse(JSON.stringify(entry)));
                this.selectEntry(this._sel + 1);
            });

            this.q(".cb-pal-del").addEventListener("click", () => {
                const entry = this.palette[this._sel];
                if (!entry) return;
                const at = this._sel;
                this.palette.splice(at, 1);
                // Deleting the last colour leaves a blank one behind rather
                // than an empty palette and a mix belonging to nothing.
                if (!this.palette.length) this.palette.push(this.freshEntry());
                this.selectEntry(at);
                this.toast("Deleted " + entry.hex);
            });

            /* Reordering by dragging. sac-swatch-grid displays, it does not
               manage, so this is the app's: the swatches are light-DOM
               children, which is exactly what makes plain HTML5 drag and drop
               possible without reaching into anything. */
            pal.addEventListener("dragstart", (e) => {
                const sw = e.target.closest && e.target.closest("sac-swatch");
                if (!sw || sw.parentElement !== pal) return;
                this._dragFrom = Array.prototype.indexOf.call(pal.children, sw);
                sw.classList.add("cb-dragging");
                e.dataTransfer.effectAllowed = "move";
                try { e.dataTransfer.setData("text/plain", sw.getAttribute("value") || ""); }
                catch (err) { /* Safari refuses an empty payload */ }
            });
            /* Two kinds of drag land here: one of the palette's own swatches
               being reordered, and a swatch dragged in from the generated
               palette. They differ only in where they came from, so the
               position under the pointer is worked out once and the source
               decides what happens with it. */
            const dropIndex = (e) => {
                const sw = e.target.closest && e.target.closest("sac-swatch");
                return (sw && sw.parentElement === pal)
                    ? { at: Array.prototype.indexOf.call(pal.children, sw), sw: sw }
                    : { at: this.palette.length, sw: null };   // past the last cell
            };
            pal.addEventListener("dragover", (e) => {
                const incoming = e.dataTransfer.types.indexOf(DRAG_TYPE) >= 0;
                if (this._dragFrom == null && !incoming) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = incoming ? "copy" : "move";
                const t = dropIndex(e);
                if (t.sw) this.markDropTarget(t.sw);
            });
            pal.addEventListener("drop", (e) => {
                const t = dropIndex(e);
                if (this._dragFrom != null) { e.preventDefault(); this.dropAt(t.at); return; }
                const raw = e.dataTransfer.getData(DRAG_TYPE);
                if (!raw) return;
                e.preventDefault();
                this.endDrag();
                let entry = null;
                try { entry = this.normalizeEntry(JSON.parse(raw)); } catch (err) { return; }
                if (!entry) return;
                // Already kept: point at the one that is there rather than
                // quietly making a second copy of the same colour.
                const at = this.palette.findIndex((x) => x.hex === entry.hex);
                if (at >= 0) { this.selectEntry(at); this.toast("Already in the palette"); return; }
                this.palette.splice(t.at, 0, entry);
                this.selectEntry(t.at);
            });
            pal.addEventListener("dragend", () => this.endDrag());

            this.q(".cb-harm-add").addEventListener("click", () => {
                if (!this._harmony) return;
                const before = this.palette.length;
                for (const s of this._harmony.hues.concat(this._harmony.neutrals)) {
                    if (this.hasColour(s.hex)) continue;
                    this.palette.push(this.entryFromHarmony(s));
                }
                const added = this.palette.length - before;
                if (added) { this.renderPalette(); this.savePalette(); this.commit(); }
                this.toast(added ? "Added " + added + " to the palette" : "Already in the palette");
            });

            /* The harmony grids copy on click. The PALETTE grid does not:
               it is selectable, so a click there means "act on this one" and
               the toolbar carries the actions. */
            for (const key of ["hues", "neutrals"]) {
                const grid = this.q(".cb-harm-" + key);
                grid.addEventListener("click", (e) => {
                    const sw = e.target.closest("sac-swatch");
                    if (sw) this.copy(String(sw.getAttribute("value")).toUpperCase());
                });
                // …and dragged into the palette, which is the same gesture the
                // palette already uses to reorder itself. What travels is the
                // whole entry: colour, recipe and name.
                grid.addEventListener("dragstart", (e) => {
                    const sw = e.target.closest && e.target.closest("sac-swatch");
                    if (!sw || sw.parentElement !== grid || !this._harmony) return;
                    const src = this._harmony[key][Array.prototype.indexOf.call(grid.children, sw)];
                    if (!src) return;
                    e.dataTransfer.effectAllowed = "copy";
                    try {
                        e.dataTransfer.setData(DRAG_TYPE, JSON.stringify(this.entryFromHarmony(src)));
                        e.dataTransfer.setData("text/plain", src.hex);
                    } catch (err) { /* Safari refuses some payloads */ }
                });
            }

            // A shared link opened while the app is already running.
            this._offRoute = context.onRoute((route) => {
                const r = decodeRecipe(route);
                if (!r || encodeRecipe(this.buckets, this.mode, this.shelf) === route) return;
                this.buckets = r.buckets; this.mode = r.mode; this.shelf = r.shelf;
                /* A pasted link is a DIFFERENT colour, not an edit of the one
                   currently open — without letting go first, the write-back
                   would quietly overwrite it with what the link carried. */
                this._sel = -1;
                this.q(".cb-shelves").setAttribute("active", this.shelf);
                this.fillShelf(this.shelf);
                this.buildRows();
                this.setMode(this.mode, true);
                this.showNote();
                // setMode is silenced above so the mix is computed once, not
                // twice — which means the refresh has to happen here. Without
                // it the rows show the new recipe while the result, the pot
                // pills and the palette still describe the old one.
                this.refresh();
                // …and the link's colour has to become one of the palette's,
                // or the app would sit on a mix that belongs to nothing.
                if (this._loaded) { this.ensureCurrent(); this.commit(); }
            });

            this.renderPalette();
            this.setMode(this.mode, true);
            this.refresh();
            // No floor yet: loadPalette lays it when the palette is actually
            // there. Until then undo, redo and the palette buttons are dead.
            this.syncHistoryButtons();
            this.loadPalette();
        }

        /** Undo exactly what onMount did. */
        onUnmount() {
            if (this._offRoute) { this._offRoute(); this._offRoute = null; }
            // A pending write must not fire into a dead element.
            if (this._saveTimer) { clearTimeout(this._saveTimer); this._saveTimer = null; this.savePalette(); }
        }

        q(sel) { return this.querySelector(sel); }

        /* ---------------------------------------------------------- palette --
           An entry is a colour AND the recipe that made it:

               { hex, buckets: [{c,w}] | null, mode, shelf }

           Keeping the hex alone would be the dead end this app exists to
           escape: you could look at the colour and never adjust it again.

           EVERY entry has a recipe, so choosing one always opens something
           editable. A colour that arrives without one — a blend, a ramp step,
           a palette stored before recipes existed — gets the only honest
           one there is: itself, one part. That is not a placeholder; a
           one-pot mix is measured identity through the engine, checked on
           every corner of every shelf. */

        /** The current recipe as an entry. Cloned: the palette must not move
            when the recipe does. */
        entryFromRecipe(hex) {
            return {
                hex: hex.toUpperCase(),
                buckets: this.buckets.map((b) => ({ c: b.c, w: b.w })),
                mode: this.mode,
                shelf: this.shelf,
            };
        }

        /* ---- the invariant -------------------------------------------
           There is no such thing as a mix that belongs to nothing. What the
           mixer shows is ALWAYS a palette colour, and editing it edits that
           colour. Everything below exists to keep that true: after a delete,
           after clearing the palette, and on the way in from a shared link. */

        /** The smallest thing that is already a colour: one pot, one part. */
        freshEntry() {
            const first = shelfById(this.shelf).pots[0];
            return {
                hex: first.c,
                buckets: [{ c: first.c, w: 1 }],
                mode: this.mode,
                shelf: this.shelf,
            };
        }

        /** Make entry i the one being mixed. */
        selectEntry(i) {
            this._sel = Math.max(0, Math.min(i, this.palette.length - 1));
            this.renderPalette();
            this.savePalette();
            this.loadEntry(this.palette[this._sel]);
        }

        /** Called once the stored palette is really there: the recipe the app
            opened with — a shared link, or the default — has to BE one of the
            colours. Matched on the whole recipe rather than on the resulting
            hex, because two different recipes can land on the same colour and
            opening one must not hand you the other. */
        ensureCurrent() {
            const want = encodeRecipe(this.buckets, this.mode, this.shelf);
            let at = this.palette.findIndex((e) =>
                encodeRecipe(e.buckets, e.mode, e.shelf) === want);
            if (at < 0) {
                this.palette.push(this.entryFromRecipe(this.q(".cb-hex").textContent));
                at = this.palette.length - 1;
            }
            this._sel = at;
            this.renderPalette();
            this.savePalette();
        }

        /** A swatch out of the generated palette, kept. Two things ride along
            that a hand-mixed colour has not got: the recipe that made it, so it
            stays adjustable, and the NAME it had in the generated palette —
            "neutral 500", "Cadmium Yellow + Ultramarine Blue" — which is what
            lets the CSS export emit a token rather than a numbered colour. */
        entryFromHarmony(sw) {
            const neutral = this._harmony && this._harmony.neutrals.indexOf(sw) >= 0;
            return {
                hex: sw.hex,
                buckets: sw.recipe
                    ? sw.recipe.map((b) => ({ c: b.c, w: b.w }))
                    : [{ c: sw.hex, w: 1 }],
                mode: this.mode,
                shelf: this.shelf,
                label: neutral ? "neutral " + sw.label : sw.label,
            };
        }

        /** A colour with no recipe but its own: one part of itself. */
        entryOf(hex) {
            return {
                hex: hex.toUpperCase(),
                buckets: [{ c: hex.toUpperCase(), w: 1 }],
                mode: this.mode,
                shelf: this.shelf,
            };
        }

        /** Tolerant on the way in: the palette used to be an array of bare
            hex strings, and a file people hand around should not be fussy. */
        normalizeEntry(raw) {
            if (typeof raw === "string") {
                return sac.color.parse(raw) ? this.entryOf(raw) : null;
            }
            if (!raw || typeof raw !== "object" || !sac.color.parse(raw.hex)) return null;
            const bs = Array.isArray(raw.buckets)
                ? raw.buckets
                    .filter((b) => b && sac.color.parse(b.c))
                    .map((b) => ({ c: String(b.c).toUpperCase(),
                                   w: Math.min(MAX_PARTS, Math.max(1, Number(b.w) || 1)) }))
                : null;
            const hex = String(raw.hex).toUpperCase();
            const out = {
                hex: hex,
                buckets: bs && bs.length ? bs : [{ c: hex, w: 1 }],
                mode: raw.mode === "rgb" ? "rgb" : "pigment",
                shelf: raw.shelf && shelfById(raw.shelf) ? raw.shelf : "oils",
            };
            // A name earned in a generated palette is what the CSS export turns
            // into a token, so it has to survive storage and undo like the rest.
            if (typeof raw.label === "string" && raw.label) out.label = raw.label;
            return out;
        }

        hasColour(hex) {
            return this.palette.some((e) => e.hex.toUpperCase() === String(hex).toUpperCase());
        }

        /** One line naming what made the colour — it becomes the swatch's
            accessible name and its tooltip. */
        entryLabel(entry) {
            return swatchTitle(entry.label || "", entry.hex, entry.buckets);
        }

        /** Put a stored recipe back in the mixer, exactly as it was saved. */
        loadEntry(entry) {
            this.buckets = entry.buckets.map((b) => ({ c: b.c, w: b.w }));
            this.mode = entry.mode || "pigment";
            this.shelf = entry.shelf && shelfById(entry.shelf) ? entry.shelf : this.shelf;
            this.q(".cb-shelves").setAttribute("active", this.shelf);
            this.fillShelf(this.shelf);
            this.buildRows();
            this.setMode(this.mode, true);
            this.showNote();
            this.refresh();
            this.commit();
        }

        /** Nothing chosen, nothing to act on — and nothing at all until the
            stored palette has arrived, or a click in that window would act on
            an emptiness that is only there because reading takes a moment. */
        syncPaletteButtons() {
            const entry = this._loaded && this.palette[this._sel];
            this.q(".cb-pal-new").disabled = !this._loaded;
            this.q(".cb-pal-add").disabled = !this._loaded;
            this.q(".cb-pal-dup").disabled = !entry;
            this.q(".cb-pal-del").disabled = !entry;
        }

        /* ------------------------------------------------------- reordering */
        markDropTarget(sw) {
            if (this._dropOn === sw) return;
            if (this._dropOn) this._dropOn.classList.remove("cb-drop-target");
            this._dropOn = sw;
            sw.classList.add("cb-drop-target");
        }

        dropAt(to) {
            const from = this._dragFrom;
            this.endDrag();
            if (from == null || to < 0 || to === from) return;
            const moved = this.palette.splice(from, 1)[0];
            this.palette.splice(to, 0, moved);
            // The selection follows the colour, not the position it left.
            if (this._sel === from) this._sel = to;
            else if (this._sel > from && this._sel <= to) this._sel -= 1;
            else if (this._sel < from && this._sel >= to) this._sel += 1;
            this.renderPalette(); this.savePalette(); this.commit();
        }

        endDrag() {
            const grid = this.q(".cb-pal-grid");
            for (const sw of grid.children) sw.classList.remove("cb-dragging", "cb-drop-target");
            this._dragFrom = null;
            this._dropOn = null;
        }

        /* The edit IS the save. Every recipe change writes straight back into
           the chosen palette colour — there is no second gesture to forget,
           which is the whole point of the palette holding recipes at all.
           The swatch is updated in place: grid.colors would rebuild all of
           them and throw away the selection mid-drag of a stepper. */
        syncSelectedEntry(hex) {
            if (this._restoring) return;
            const entry = this.palette[this._sel];
            if (!entry) return;
            entry.hex = hex;
            entry.buckets = this.buckets.map((b) => ({ c: b.c, w: b.w }));
            entry.mode = this.mode;
            entry.shelf = this.shelf;
            const sw = this.q(".cb-pal-grid").children[this._sel];
            if (sw) {
                sw.setAttribute("value", hex);
                sw.setAttribute("label", this.entryLabel(entry));
            }
            this.savePaletteSoon();
        }

        /** Held down, a stepper fires per step. The palette follows every one
            of them on screen; the FILE only needs the one that stands. */
        savePaletteSoon() {
            if (this._saveTimer) clearTimeout(this._saveTimer);
            this._saveTimer = setTimeout(() => {
                this._saveTimer = null;
                this.savePalette();
            }, 400);
        }

        /* ------------------------------------------------------------- file --
           Download and upload as JSON, recipes included, so a palette survives
           this browser and stays adjustable somewhere else. */
        savePaletteFile() {
            if (!this.palette.length) { this.toast("Nothing to save yet"); return; }
            const doc = {
                format: "color-bucket-palette",
                version: 1,
                colors: this.palette.map((e) => ({
                    hex: e.hex,
                    recipe: e.buckets ? { buckets: e.buckets, mode: e.mode, shelf: e.shelf } : null,
                })),
            };
            const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "color-bucket-palette.json";
            document.body.appendChild(a);
            a.click();
            a.remove();
            // Revoking straight away cancels the download in some browsers.
            setTimeout(() => URL.revokeObjectURL(url), 10000);
            this.toast("Saved " + this.palette.length + " colours");
        }

        loadPaletteFile(file) {
            const reader = new FileReader();
            reader.onerror = () => this.toast("Could not read that file");
            reader.onload = () => {
                let doc;
                try { doc = JSON.parse(String(reader.result)); }
                catch (err) { this.toast("That file is not JSON"); return; }

                // Our own document, or a bare array of colours.
                const raw = Array.isArray(doc) ? doc
                    : (doc && Array.isArray(doc.colors) ? doc.colors : null);
                if (!raw) { this.toast("No colours in that file"); return; }

                const entries = raw.map((c) => {
                    if (typeof c === "string") return this.normalizeEntry(c);
                    if (!c || typeof c !== "object") return null;
                    const r = c.recipe || {};
                    return this.normalizeEntry({ hex: c.hex, buckets: r.buckets,
                                                 mode: r.mode, shelf: r.shelf });
                }).filter(Boolean);

                if (!entries.length) { this.toast("No usable colours in that file"); return; }
                this.palette = entries;
                this.selectEntry(0);
                this.toast("Loaded " + entries.length + " colours");
            };
            reader.readAsText(file);
        }

        /* ---------------------------------------------------------- history --
           One stack over the whole editable state — recipe and palette both.
           Snapshots are compared before they are pushed, so holding a stepper
           or dragging the picker cannot fill the stack with duplicates. */
        snapshot() {
            return JSON.stringify({
                buckets: this.buckets, mode: this.mode, shelf: this.shelf,
                palette: this.palette, sel: this._sel,
            });
        }

        commit() {
            if (this._restoring || !this._loaded) return;
            const snap = this.snapshot();
            if (this._history[this._hi] === snap) return;
            this._history.length = this._hi + 1;     // a new move drops the redo tail
            this._history.push(snap);
            if (this._history.length > 60) this._history.shift();
            this._hi = this._history.length - 1;
            this.syncHistoryButtons();
        }

        /** Restoring a saved palette is not a move the user made, so it must
            not be undoable back to "empty". Whatever the app opened with
            becomes the floor of the stack, once. */
        resetHistory() {
            this._history = [this.snapshot()];
            this._hi = 0;
            this.syncHistoryButtons();
        }

        undo() { this.travel(-1); }
        redo() { this.travel(1); }

        travel(step) {
            const next = this._hi + step;
            if (next < 0 || next >= this._history.length) return;
            this._hi = next;
            this.applySnapshot(JSON.parse(this._history[next]));
            this.syncHistoryButtons();
        }

        applySnapshot(state) {
            this._restoring = true;
            try {
                this.buckets = state.buckets.map((b) => ({ c: b.c, w: b.w }));
                this.mode = state.mode;
                this.shelf = state.shelf;
                this.palette = state.palette.map((e) => this.normalizeEntry(e)).filter(Boolean);
                // Which colour was open is part of the state — undo puts you
                // back in front of the one you were mixing.
                this._sel = Math.min(state.sel == null ? -1 : state.sel, this.palette.length - 1);
                this.q(".cb-shelves").setAttribute("active", this.shelf);
                this.fillShelf(this.shelf);
                this.buildRows();
                this.setMode(this.mode, true);
                this.showNote();
                this.renderPalette();
                this.savePalette();
                this.refresh();
            } finally { this._restoring = false; }
        }

        syncHistoryButtons() {
            this.q(".cb-undo").disabled = this._hi <= 0;
            // length 0 makes this -1, so an empty stack disables both — which
            // is exactly the state before the palette has been read.
            this.q(".cb-redo").disabled = this._hi >= this._history.length - 1;
        }

        /* ---------------------------------------------------------- storage --
           context.fs is rooted at the app id, so a palette saved standalone is
           still there once the app is installed on a desktop. */
        async loadPalette() {
            try {
                if (this._ctx && this._ctx.fs) {
                    const saved = await this._ctx.fs.read("palette.json", null);
                    const list = typeof saved === "string" ? JSON.parse(saved) : saved;
                    if (Array.isArray(list)) {
                        this.palette = list.map((e) => this.normalizeEntry(e)).filter(Boolean);
                    }
                }
            } catch (e) { /* an unreadable palette is not worth an error */ }
            /* Opened, however it went — no host, no file, or a broken one. The
               app is only allowed to record and to write from here on, and
               what is on screen NOW is the floor of the undo stack. */
            this._loaded = true;
            this.ensureCurrent();
            this.resetHistory();
        }

        savePalette() {
            if (!this._loaded) return;      // never write what we have not read
            if (!this._ctx || !this._ctx.fs) return;
            Promise.resolve(this._ctx.fs.write("palette.json", JSON.stringify(this.palette))).catch(() => {});
        }

        /* ------------------------------------------------------------ pots --
           Grids are filled through the kit's .colors setter — the one bulk
           rebuild sac-swatch-grid sanctions, and exactly the JS-driven case it
           names. Lazily, because eleven shelves upfront is 176 elements nobody
           has asked to see. */
        fillShelf(id) {
            if (this._filled[id]) return;
            const grid = this.q('sac-swatch-grid[data-shelf="' + id + '"]');
            if (!grid) return;
            grid.colors = shelfById(id).pots.map((p) =>
                ({ value: p.c, label: swatchTitle(p.name, p.c) }));
            this._filled[id] = true;
        }

        /** The shelf's own small print, if it has any. Only RAL does. */
        showNote() {
            const banner = this.q(".cb-shelf-note");
            const note = shelfById(this.shelf).note;
            if (note) banner.show(note, "info"); else banner.hide();
        }

        /* ---------------------------------------------------------- recipe --
           One row per pigment: the kit's colour field carries the well, the hex
           input and the name; the stepper carries the parts. Both were
           hand-built here once — and sac-stepper's own documentation gives
           "paint-part counts" as its example. */
        buildRows() {
            const box = this.q(".cb-rows");
            box.textContent = "";
            this._rows = this.buckets.map((b, i) => {
                const row = document.createElement("div");
                row.className = "cb-row";

                /* The name spans the whole row rather than riding along as the
                   colour field's own label: the field's label sits above the
                   field ONLY, which leaves a hole over the stepper and the
                   delete button and makes three controls of slightly different
                   heights look scattered. One caption, then one line. */
                const name = document.createElement("span");
                // .sac-caption is the kit's: the same --caption-* tokens
                // sac-section's own title reads, so a caption and the heading
                // above it can no longer drift apart. .cb-row-name is only
                // what is left over — where it sits, not what it looks like.
                name.className = "cb-row-name sac-caption";
                name.textContent = potName(b.c);

                const controls = document.createElement("div");
                controls.className = "cb-row-controls";

                const field = document.createElement("sac-color-field");
                field.setAttribute("value", b.c);
                // sac:color-change folded into the unified sac:change in 2.0.0;
                // the detail.value read below was already right.
                field.addEventListener("sac:change", (e) => {
                    b.c = String(e.detail.value).toUpperCase();
                    name.textContent = potName(b.c);
                    parts.setAttribute("label", "Parts of " + potName(b.c));
                    del.setAttribute("aria-label", "Remove " + potName(b.c));
                    this.refresh();
                    this.commit();
                });

                const parts = document.createElement("sac-stepper");
                parts.setAttribute("value", String(b.w));
                parts.setAttribute("min", "1");
                parts.setAttribute("max", String(MAX_PARTS));
                parts.setAttribute("unit", "parts");
                parts.setAttribute("label", "Parts of " + potName(b.c));
                parts.addEventListener("sac:change", (e) => {
                    b.w = e.detail.value; this.refresh(); this.commit();
                });

                const del = document.createElement("button");
                del.type = "button";
                del.className = "btn cb-del";
                del.appendChild(document.createElement("sac-icon")).setAttribute("name", "trash");
                del.setAttribute("aria-label", "Remove " + potName(b.c));
                del.disabled = this.buckets.length < 2;
                del.addEventListener("click", () => {
                    if (this.buckets.length < 2) return;
                    this.buckets.splice(i, 1);
                    this.buildRows(); this.refresh(); this.commit();
                });

                controls.append(field, parts, del);
                row.append(name, controls);
                box.appendChild(row);
                return { row, name, field, parts, del };
            });
        }

        renderPalette() {
            const grid = this.q(".cb-pal-grid");
            if (this._sel >= this.palette.length) this._sel = -1;
            grid.colors = this.palette.map((e, i) => ({
                value: e.hex,
                label: this.entryLabel(e),
                selected: i === this._sel,
            }));
            // .colors rebuilds the children, so draggable is set here rather
            // than once: it is a property of every swatch this grid holds.
            for (const sw of grid.children) sw.setAttribute("draggable", "true");
            // Only ever true in the moment before the stored palette lands.
            grid.hidden = !this.palette.length;
            this.syncPaletteButtons();
        }

        setMode(m, silent) {
            this.mode = m;
            const seg = this.q(".cb-mode");
            if (seg.getAttribute("value") !== m) seg.setAttribute("value", m);
            if (!silent) this.refresh();
        }

        /** In-place value refresh — never touches DOM structure. */
        refresh() {
            const grid = this.q('sac-swatch-grid[data-shelf="' + this.shelf + '"]');
            if (grid) {
                for (const sw of grid.children) {
                    const hex = String(sw.getAttribute("value") || "").toUpperCase();
                    const hit = this.buckets.filter((x) => x.c.toUpperCase() === hex)[0];
                    // count is the kit's corner pill, and "3 parts of this pot"
                    // is a count — the pill doing its job, not a borrowed one.
                    if (hit) sw.setAttribute("count", String(hit.w)); else sw.removeAttribute("count");
                }
            }

            this.buckets.forEach((b, i) => {
                const r = this._rows[i];
                if (!r) return;
                if (String(r.field.value || "").toUpperCase() !== b.c.toUpperCase()) r.field.value = b.c;
                if (r.name.textContent !== potName(b.c)) r.name.textContent = potName(b.c);
                if (Number(r.parts.value) !== b.w) r.parts.value = b.w;
                r.del.disabled = this.buckets.length < 2;
            });

            const main = this.mode === "pigment" ? mixPigment(this.buckets) : mixRGB(this.buckets);
            const other = this.mode === "pigment" ? mixRGB(this.buckets) : mixPigment(this.buckets);
            const result = this.q(".cb-result");
            result.style.background = main;
            // Contrast against a data colour, not against a theme — the mix can
            // be anything, so the ink comes from sac.color.onColor rather than
            // from a token that cannot know what it is sitting on.
            result.style.color = inkOn(main);
            this.q(".cb-hex").textContent = main;
            const chip = this.q(".cb-cmp-chip");
            chip.setAttribute("value", other);
            chip.setAttribute("label", other);
            this.q(".cb-cmp-text").textContent =
                (this.mode === "pigment" ? "What RGB would give you: " : "What pigment would give you: ") + other;

            this.syncSelectedEntry(main);
            this.updateHarmony();

            if (this._ctx && this._ctx.deepLink) {
                this._ctx.deepLink.set(encodeRecipe(this.buckets, this.mode, this.shelf));
            }
        }

        /* ---------------------------------------------------------- harmony --
           A limited palette out of the pots already in the recipe, built with
           whichever mixer the mode selects.
           Following the mode is deliberate, but not because RGB loses overall:
           measured on cadmium yellow + cadmium red + ultramarine, mean blend
           chroma is 0.105 pigment against 0.108 RGB — a tie, the same result
           the mixing proof reports. What changes is WHICH blends live. Yellow +
           blue collapses to khaki in RGB (0.075 against 0.132), the case this
           app exists for; red + blue gains a plum it has no business having
           (0.103 against 0.029), because no painter gets violet out of a warm
           red and ultramarine either. Showing both is the honest argument. */
        updateHarmony() {
            const box = this.q(".cb-harmony");
            const gen = window.cbHarmony;
            if (!gen) { box.hidden = true; return; }

            const ends = shelfEnds(this.shelf);
            const built = gen.build({
                sources: this.buckets.map((b) => b.c),
                white: ends.white,
                dark: ends.dark,
                mix: this.mode === "pigment" ? mixPigment : mixRGB,
                name: potName,
            });

            this._harmony = built;
            box.hidden = !built;
            if (!built) return;

            this.q(".cb-harm-hues").colors = built.hues.map((h) =>
                ({ value: h.hex, label: swatchTitle(h.label, h.hex, h.recipe) }));
            // .colors rebuilds the children, so this is set per render.
            for (const sw of this.q(".cb-harm-hues").children) sw.setAttribute("draggable", "true");
            /* No badge and no caption on these. The step number was a `count`
               once — which the kit documents as a count and nothing else, and
               which put a pill ON the colour and into the browser's drag image.
               A `caption` fixed that and printed the scale under every cell,
               which is more furniture than a ramp needs on a colour plane. So
               the number moved into the one place that costs no pixels until
               it is asked for: the hover text, in the same shape every other
               swatch in this app uses. */
            this.q(".cb-harm-neutrals").colors = built.neutrals.map((n) =>
                ({ value: n.hex, label: swatchTitle("Step " + n.label, n.hex, n.recipe) }));
            for (const sw of this.q(".cb-harm-neutrals").children) sw.setAttribute("draggable", "true");
            this.q(".cb-harm-why").textContent =
                built.sources.length + " pigments · every colour mixed from them";
        }

        /* The About is the KIT's surface, not ours — 2.3.0 ships it so that
           every app's credits come out the same shape and a host's About and
           an app's About read as relatives. This app asked for that and then
           had to be the first to stop hand-rolling one.

           Everything it renders is manifest data: name, icon, version, the
           description, and the `notices` array. Hosted, context.manifest hands
           it over. Standalone there is no manifest in the context (the kit
           says so out loud), so app.json is fetched — once, on the first click.
           Reading the same file a host would read is what keeps the licence
           text in ONE place. */
        async aboutData() {
            if (this._ctx && this._ctx.manifest) return this._ctx.manifest;
            if (!this._manifest) {
                this._manifest = await fetch(BASE + "app.json").then((r) => r.json());
            }
            return this._manifest;
        }

        async showAbout() {
            sac.about.open(await this.aboutData());
        }

        /** Copies a colour and says so by showing it — the value is short. */
        copy(text) { this.copyRaw(text, "Copied " + text); }

        /** Copies anything. A twenty-line block of CSS does not belong in a
            toast, so the announcement is separate from what lands on the
            clipboard. */
        copyRaw(text, message) {
            const done = () => this.toast(message);
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(done, () => this.copyFallback(text, done));
            } else this.copyFallback(text, done);
        }

        copyFallback(text, done) {
            const t = document.createElement("textarea");
            t.value = text;
            t.style.cssText = "position:fixed;top:-1000px";
            document.body.appendChild(t);
            t.select();
            try { document.execCommand("copy"); } catch (e) { /* nothing else to try */ }
            t.remove();
            done();
        }

        /** sac.toast ships with the kit but is still the host's to provide —
            guard it rather than assume it, and never hand-roll a second one. */
        toast(message) {
            if (typeof sac.toast === "function") sac.toast(message, { kind: "success" });
        }
    }

    /* ------------------------------------------------------------- engine --
       One <script> per document however many app instances exist. Two files:
       the mixing engine, and the palette generator that has to be loadable by
       Node as well so the tests can drive it. Both are plain classic scripts —
       still no build step anywhere. */
    const SCRIPTS = [
        { id: "color-bucket-spectral", src: "vendor/spectral.min.js", global: "spectral", required: true },
        { id: "color-bucket-harmony", src: "lib/harmony.js", global: "cbHarmony", required: false },
    ];

    function loadScript(spec, done) {
        if (window[spec.global]) return done();
        let s = document.getElementById(spec.id);
        if (!s) {
            s = document.createElement("script");
            s.id = spec.id;
            s.src = BASE + spec.src;
            document.head.appendChild(s);
        }
        s.addEventListener("load", done, { once: true });
        s.addEventListener("error", () => {
            console.error("[color-bucket] failed to load " + s.src);
            // Mixing is the app; a palette generator is not. Losing the engine
            // means never defining the tag, losing harmony means one hidden
            // panel — so only the optional one lets the app continue.
            if (!spec.required) done();
        }, { once: true });
    }

    function withScripts(done) {
        let left = SCRIPTS.length;
        SCRIPTS.forEach((s) => loadScript(s, () => { if (--left === 0) done(); }));
    }

    withScripts(() => sac.app.define("app-color-bucket", AppColorBucket));
})();
