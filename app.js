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
                return m ? { c: "#" + m[1].toUpperCase(), w: Math.min(99, Math.max(1, parseInt(m[2], 10))) } : null;
            });
            if (!bs.length || !bs.every(Boolean)) return null;
            return {
                buckets: bs,
                mode: parts[1] === "rgb" ? "rgb" : "pigment",
                shelf: parts[2] && shelfById(parts[2]) ? parts[2] : "oils",
            };
        } catch (e) { return null; }
    }

    const NOTE = {
        pigment: "Pigment mixes subtractively — spectral Kubelka-Munk over 38 wavelength bands: " +
                 "yellow + blue makes green, like on a palette, not in a color space.",
        rgb: "RGB averages the channel values — fast, but mixes often turn gray and muddy.",
    };

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
                <div class="cb-stage">
                    <aside class="sidebar cb-side">
                        <sac-section title="Paint pots">
                            <!-- overflow="wrap": eleven shelves do not fit one
                                 row of a sidebar. Ignored by kit builds older
                                 than the one that added it, which costs
                                 nothing — the strip simply stays as it was. -->
                            <sac-tab-group class="cb-shelves" overflow="wrap" active="${this.shelf}">
                                ${tabs}${panels}
                            </sac-tab-group>
                            <p class="cb-hint">Tap a pot to add a dab — tap again for another part.</p>
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
                            <p class="cb-note"></p>
                        </sac-section>

                        <sac-section title="Palette">
                            <div class="empty-state cb-pal-empty">
                                <p>Nothing here yet — mix something and save it.</p>
                            </div>
                            <sac-swatch-grid class="cb-pal-grid" columns="6" hidden></sac-swatch-grid>
                            <button type="button" class="btn cb-copy-pal" hidden>Copy all hex values</button>
                        </sac-section>

                    </aside>

                    <main class="cb-result" aria-live="polite">
                        <p class="cb-result-name">Your mix</p>
                        <h1 class="cb-hex">#000000</h1>
                        <div class="cb-actions">
                            <button type="button" class="btn cb-copy-hex">Copy hex</button>
                            <button type="button" class="btn primary cb-to-pal">Save to palette</button>
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
                                <button type="button" class="btn cb-harm-css">Copy as CSS</button>
                            </p>
                        </section>
                    </main>
                </div>`;
        }

        /** Once, when the app is really on screen. */
        onMount(context) {
            this._ctx = context;

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
                if (hit) { if (hit.w < 99) { hit.w++; this.refresh(); } }
                else { this.buckets.push({ c: hex, w: 1 }); this.buildRows(); this.refresh(); }
            });

            this.q(".cb-shelves").addEventListener("sac:tab-show", (e) => {
                this.shelf = e.detail.name;
                this.fillShelf(this.shelf);
                this.showNote();
                this.refresh();
            });

            this.q(".cb-mode").addEventListener("change", (e) => this.setMode(e.detail));

            this.q(".cb-add").addEventListener("click", () => {
                this.buckets.push({ c: "#D0342C", w: 1 });
                this.buildRows(); this.refresh();
            });
            this.q(".cb-copy-hex").addEventListener("click", () => this.copy(this.q(".cb-hex").textContent));
            this.q(".cb-to-pal").addEventListener("click", () => {
                const h = this.q(".cb-hex").textContent;
                if (this.palette.indexOf(h) === -1) { this.palette.push(h); this.renderPalette(); this.savePalette(); }
            });
            this.q(".cb-copy-pal").addEventListener("click", () => this.copy(this.palette.join(", ")));
            /* An app-level action belongs in the ribbon, not in the app's own
               body: sac.toolbar is the ribbon counterpart of context.sidebar,
               so every app on the desktop wears the same chrome. Guarded like
               every other host-provided global. */
            if (sac.toolbar) {
                sac.toolbar.set([
                    { icon: "info", title: "About & credits", onClick: () => this.showAbout() },
                ]);
            }

            this.q(".cb-harm-add").addEventListener("click", () => {
                if (!this._harmony) return;
                const before = this.palette.length;
                for (const s of this._harmony.hues.concat(this._harmony.neutrals)) {
                    if (this.palette.indexOf(s.hex) === -1) this.palette.push(s.hex);
                }
                const added = this.palette.length - before;
                if (added) { this.renderPalette(); this.savePalette(); }
                this.toast(added ? "Added " + added + " to the palette" : "Already in the palette");
            });
            // The ramp is already labelled on the scale a design system uses,
            // so getting from "nice colours" to "tokens I can build on" should
            // be a copy rather than a retyping job.
            this.q(".cb-harm-css").addEventListener("click", () => {
                if (!this._harmony || !window.cbHarmony) return;
                this.copyRaw(cbHarmony.toCSS(this._harmony),
                    "Copied the palette as CSS custom properties");
            });

            // Every swatch outside the pots is a colour you might want to keep.
            for (const cls of [".cb-pal-grid", ".cb-harm-hues", ".cb-harm-neutrals"]) {
                this.q(cls).addEventListener("click", (e) => {
                    const sw = e.target.closest("sac-swatch");
                    if (sw) this.copy(String(sw.getAttribute("value")).toUpperCase());
                });
            }

            // A shared link opened while the app is already running.
            this._offRoute = context.onRoute((route) => {
                const r = decodeRecipe(route);
                if (!r || encodeRecipe(this.buckets, this.mode, this.shelf) === route) return;
                this.buckets = r.buckets; this.mode = r.mode; this.shelf = r.shelf;
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
            });

            this.loadPalette();
            this.renderPalette();
            this.setMode(this.mode, true);
            this.refresh();
        }

        /** Undo exactly what onMount did. */
        onUnmount() {
            if (this._offRoute) { this._offRoute(); this._offRoute = null; }
            // A shell's router clears the ribbon between view swaps, but the
            // harness has no router — and onUnmount undoes exactly what
            // onMount did, wherever it is running.
            if (sac.toolbar) sac.toolbar.clear();
            // The About window lives on document.body, outside this element,
            // so nothing else would take it away.
            if (this._about) { this._about.remove(); this._about = null; }
        }

        q(sel) { return this.querySelector(sel); }

        /* ---------------------------------------------------------- storage --
           context.fs is rooted at the app id, so a palette saved standalone is
           still there once the app is installed on a desktop. */
        async loadPalette() {
            if (!this._ctx || !this._ctx.fs) return;
            try {
                const saved = await this._ctx.fs.read("palette.json", null);
                const list = typeof saved === "string" ? JSON.parse(saved) : saved;
                if (Array.isArray(list)) {
                    this.palette = list
                        .filter((h) => typeof h === "string" && sac.color.parse(h))
                        .map((h) => h.toUpperCase());
                    this.renderPalette();
                }
            } catch (e) { /* an unreadable palette is not worth an error */ }
        }

        savePalette() {
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
            grid.colors = shelfById(id).pots.map((p) => ({ value: p.c, label: p.name }));
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
                name.className = "cb-row-name";
                name.textContent = potName(b.c);

                const controls = document.createElement("div");
                controls.className = "cb-row-controls";

                const field = document.createElement("sac-color-field");
                field.setAttribute("value", b.c);
                field.addEventListener("sac:color-change", (e) => {
                    b.c = String(e.detail.value).toUpperCase();
                    name.textContent = potName(b.c);
                    parts.setAttribute("label", "Parts of " + potName(b.c));
                    del.setAttribute("aria-label", "Remove " + potName(b.c));
                    this.refresh();
                });

                const parts = document.createElement("sac-stepper");
                parts.setAttribute("value", String(b.w));
                parts.setAttribute("min", "1");
                parts.setAttribute("max", "99");
                parts.setAttribute("unit", "parts");
                parts.setAttribute("label", "Parts of " + potName(b.c));
                parts.addEventListener("sac:change", (e) => { b.w = e.detail.value; this.refresh(); });

                const del = document.createElement("button");
                del.type = "button";
                del.className = "btn cb-del";
                del.appendChild(document.createElement("sac-icon")).setAttribute("name", "trash");
                del.setAttribute("aria-label", "Remove " + potName(b.c));
                del.disabled = this.buckets.length < 2;
                del.addEventListener("click", () => {
                    if (this.buckets.length < 2) return;
                    this.buckets.splice(i, 1);
                    this.buildRows(); this.refresh();
                });

                controls.append(field, parts, del);
                row.append(name, controls);
                box.appendChild(row);
                return { row, name, field, parts, del };
            });
        }

        renderPalette() {
            const grid = this.q(".cb-pal-grid");
            grid.colors = this.palette.map((h) => ({ value: h, label: "Copy " + h }));
            grid.hidden = !this.palette.length;
            this.q(".cb-pal-empty").hidden = !!this.palette.length;
            this.q(".cb-copy-pal").hidden = !this.palette.length;
        }

        setMode(m, silent) {
            this.mode = m;
            const seg = this.q(".cb-mode");
            if (seg.getAttribute("value") !== m) seg.setAttribute("value", m);
            this.q(".cb-note").textContent = NOTE[m];
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

            this.q(".cb-harm-hues").colors =
                built.hues.map((h) => ({ value: h.hex, label: h.label }));
            // The ramp step rides in `count`: the pill is a small corner label,
            // and "500" is exactly what has to stay readable on the swatch for
            // these to be usable as tokens.
            this.q(".cb-harm-neutrals").colors = built.neutrals.map((n) =>
                ({ value: n.hex, label: n.label + " — " + n.hex, count: n.label }));
            this.q(".cb-harm-why").textContent =
                built.sources.length + " pigments · every colour mixed from them";
        }

        /* Third-party notices belong in the repo and behind a deliberate
           click, never parked permanently in the app's chrome.

           A <sac-window>, not a dialog: a dialog is modal and exists to ask a
           question, and sac.dialog.confirm takes one string as textContent, so
           four paragraphs of licence text collapse into one block. A window
           takes light-DOM children, stays out of the way, and can be left open
           while you keep mixing. Created once and reopened, the way the style
           guide demonstrates. */
        showAbout() {
            let win = this._about;
            if (!win) {
                win = document.createElement("sac-window");
                win.className = "cb-about";
                win.setAttribute("title", "Color Bucket");
                win.setAttribute("controls", "close");
                win.setAttribute("no-resize", "");
                win.setAttribute("width", "440px");
                win.innerHTML =
                    "<p>Mix colors like paint, not like numbers. Built on SACRVM APPKIT.</p>" +
                    "<p><b>Pigment mixing:</b> spectral.js — MIT licence, © 2025 " +
                    "Ronald van Wijnen. Its reflectance curves follow Scott Allen Burns' " +
                    "LHTSS method. Kubelka-Munk theory: Paul Kubelka &amp; Franz Munk, 1931.</p>" +
                    "<p><b>RAL shelf:</b> “RAL” is a registered trademark of " +
                    "RAL gGmbH, which is not affiliated with this app. Those values are " +
                    "common sRGB approximations, not colour standards.</p>" +
                    "<p>Color Bucket is MIT licensed. The full notices ship in LICENSE.</p>";
                document.body.appendChild(win);
                this._about = win;
            }
            if (win.hasAttribute("minimized")) win.restore();
            win.open();
            win.bringToFront();
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
