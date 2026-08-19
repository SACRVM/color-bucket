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
        { id: "ral", label: "RAL", pots: [
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

    /* ------------------------------------------------------------- color --- */
    const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const rgb2hex = (r) => "#" + r.map((v) =>
        Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("").toUpperCase();
    const s2l = (v) => (v /= 255) <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    function luma(h) { const r = hex2rgb(h); return 0.2126 * s2l(r[0]) + 0.7152 * s2l(r[1]) + 0.0722 * s2l(r[2]); }

    /* The pots a shelf tints and shades with. Derived, not declared: several
       shelves have no white at all (Game Boy is four greens), and a shelf that
       gains a pot should not need a second edit somewhere else to stay right. */
    function shelfEnds(id) {
        const pots = shelfById(id).pots;
        let light = pots[0], dark = pots[0];
        for (const p of pots) {
            if (luma(p.c) > luma(light.c)) light = p;
            if (luma(p.c) < luma(dark.c)) dark = p;
        }
        return { white: light.c, dark: dark.c };
    }

    function parseHex(t) {
        t = String(t).trim().replace(/^#/, "");
        if (/^[0-9a-fA-F]{3}$/.test(t)) t = t.replace(/[0-9a-fA-F]/g, (c) => c + c);
        return /^[0-9a-fA-F]{6}$/.test(t) ? "#" + t.toUpperCase() : null;
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
        const out = [0, 0, 0];
        for (const b of bs) { const rgb = hex2rgb(b.c); for (let i = 0; i < 3; i++) out[i] += rgb[i] * (b.w / tw); }
        return rgb2hex(out);
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
        /** Once, on first connect. Light DOM, so the kit's tokens apply. */
        build() {
            sac.app.styles(BASE + "app.css", "app-color-bucket-css");

            this.buckets = [{ c: "#F2C500", w: 3 }, { c: "#1F3A93", w: 1 }];
            this.mode = "pigment";
            this.shelf = "oils";
            this.palette = [];
            this._potEls = [];
            this._rowEls = [];
            this._tabEls = [];

            this.innerHTML = `
                <div class="cb-stage">
                    <aside class="cb-recipe">
                        <section>
                            <p class="cb-label">Paint pots</p>
                            <div class="cb-tabs" role="group" aria-label="Choose a paint box"></div>
                            <div class="cb-pots"></div>
                            <p class="cb-hint">Tap a pot to add a dab — tap again for another part.</p>
                        </section>
                        <section>
                            <p class="cb-label">Recipe</p>
                            <div class="cb-buckets"></div>
                            <button type="button" class="cb-add">+ Custom color</button>
                        </section>
                        <section>
                            <p class="cb-label">Mixing mode</p>
                            <div class="cb-modes" role="group" aria-label="Mixing mode">
                                <button type="button" class="cb-pig" aria-pressed="true">Pigment</button>
                                <button type="button" class="cb-rgb" aria-pressed="false">RGB</button>
                            </div>
                            <p class="cb-note"></p>
                        </section>
                        <section class="cb-palette">
                            <p class="cb-label">Palette</p>
                            <div class="cb-swatches"></div>
                            <button type="button" class="btn cb-copy-pal" hidden>Copy all hex values</button>
                        </section>
                    </aside>
                    <main class="cb-result" aria-live="polite">
                        <p class="cb-result-name">Your mix</p>
                        <h1 class="cb-hex">#000000</h1>
                        <div class="cb-actions">
                            <button type="button" class="btn cb-copy-hex">Copy hex</button>
                            <button type="button" class="btn primary cb-to-pal">Save to palette</button>
                        </div>
                        <div class="cb-compare"><span class="cb-cmp-chip"></span><span class="cb-cmp-text"></span></div>
                        <section class="cb-harmony" hidden>
                            <p class="cb-harm-title">A palette from these pigments</p>
                            <div class="cb-harm-hues"></div>
                            <div class="cb-harm-neutrals"></div>
                            <p class="cb-harm-foot">
                                <span class="cb-harm-why"></span>
                                <button type="button" class="btn cb-harm-add">Add all to palette</button>
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

            this.buildTabs();
            this.buildPots();
            this.buildBuckets();
            this.setMode(this.mode, true);

            this.q(".cb-add").addEventListener("click", () => {
                this.buckets.push({ c: "#D0342C", w: 1 });
                this.buildBuckets(); this.refresh();
            });
            this.q(".cb-copy-hex").addEventListener("click", () => this.copy(this.q(".cb-hex").textContent));
            this.q(".cb-to-pal").addEventListener("click", () => {
                const h = this.q(".cb-hex").textContent;
                if (this.palette.indexOf(h) === -1) { this.palette.push(h); this.renderPalette(); this.savePalette(); }
            });
            this.q(".cb-copy-pal").addEventListener("click", () => this.copy(this.palette.join(", ")));
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
            this.q(".cb-pig").addEventListener("click", () => this.setMode("pigment"));
            this.q(".cb-rgb").addEventListener("click", () => this.setMode("rgb"));

            // A shared link opened while the app is already running.
            this._offRoute = context.onRoute((route) => {
                const r = decodeRecipe(route);
                if (!r || encodeRecipe(this.buckets, this.mode, this.shelf) === route) return;
                this.buckets = r.buckets; this.mode = r.mode; this.shelf = r.shelf;
                this.buildTabs(); this.buildPots(); this.buildBuckets(); this.setMode(this.mode, true);
                // setMode is silenced above so the mix is computed once, not
                // twice — which means the refresh has to happen here. Without
                // it the rows show the new recipe while the result, the pot
                // badges and the palette still describe the old one.
                this.refresh();
            });

            this.loadPalette();
            this.renderPalette();
            this.refresh();
        }

        /** Undo exactly what onMount did. */
        onUnmount() {
            if (this._offRoute) { this._offRoute(); this._offRoute = null; }
            clearTimeout(this._toastT);
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
                    this.palette = list.filter((h) => typeof h === "string" && parseHex(h));
                    this.renderPalette();
                }
            } catch (e) { /* a corrupt palette is not worth failing the app over */ }
        }

        savePalette() {
            if (!this._ctx || !this._ctx.fs) return;
            Promise.resolve(this._ctx.fs.write("palette.json", JSON.stringify(this.palette))).catch(() => {});
        }

        /* ------------------------------------------------------ structure --
           Structural builds run ONLY on add/remove, never on a value change:
           rebuilding a row destroys its <input type="color">, and the browser
           closes the native picker attached to it the instant it does. */
        buildTabs() {
            const box = this.q(".cb-tabs");
            box.textContent = "";
            this._tabEls = SHELVES.map((s) => {
                const b = document.createElement("button");
                b.type = "button";
                b.textContent = s.label;
                b.setAttribute("aria-pressed", String(s.id === this.shelf));
                b.addEventListener("click", () => {
                    this.shelf = s.id;
                    this._tabEls.forEach((t, j) => t.setAttribute("aria-pressed", String(SHELVES[j].id === this.shelf)));
                    this.buildPots();
                    this.refresh();
                });
                box.appendChild(b);
                return b;
            });
        }

        buildPots() {
            const box = this.q(".cb-pots");
            box.textContent = "";
            box.classList.toggle("cb-pots-few", shelfById(this.shelf).pots.length <= 8);
            this._potEls = shelfById(this.shelf).pots.map((p) => {
                const b = document.createElement("button");
                b.type = "button";
                b.className = "cb-pot";
                b.style.background = p.c;
                b.title = p.name;
                b.setAttribute("aria-label", p.name + " — add a dab");
                b.addEventListener("click", () => {
                    const hit = this.buckets.filter((x) => x.c.toUpperCase() === p.c.toUpperCase())[0];
                    if (hit) { if (hit.w < 99) { hit.w++; this.refresh(); } }
                    else { this.buckets.push({ c: p.c, w: 1 }); this.buildBuckets(); this.refresh(); }
                });
                box.appendChild(b);
                return { el: b, hex: p.c };
            });
        }

        buildBuckets() {
            const box = this.q(".cb-buckets");
            box.textContent = "";
            this._rowEls = this.buckets.map((b, i) => {
                const row = document.createElement("div");
                row.className = "cb-bucket";

                const chip = document.createElement("span");
                chip.className = "cb-chip";
                const color = document.createElement("input");
                color.type = "color";
                color.value = b.c;
                color.setAttribute("aria-label", "Pick color " + (i + 1));
                chip.appendChild(color);

                const name = document.createElement("span");
                name.className = "cb-bname";
                const nm = document.createElement("span");
                const hexIn = document.createElement("input");
                hexIn.className = "cb-hex-in";
                hexIn.type = "text";
                hexIn.value = b.c.toUpperCase();
                hexIn.spellcheck = false;
                hexIn.autocomplete = "off";
                hexIn.maxLength = 7;
                hexIn.setAttribute("aria-label", "Hex value for color " + (i + 1));
                name.appendChild(nm);
                name.appendChild(hexIn);

                const parts = document.createElement("span");
                parts.className = "cb-parts";
                const minus = document.createElement("button");
                minus.type = "button"; minus.textContent = "−";
                minus.setAttribute("aria-label", "Fewer parts");
                const n = document.createElement("span");
                n.className = "cb-n";
                const plus = document.createElement("button");
                plus.type = "button"; plus.textContent = "+";
                plus.setAttribute("aria-label", "More parts");
                parts.append(minus, n, plus);

                const del = document.createElement("button");
                del.className = "cb-del"; del.type = "button"; del.textContent = "×";
                del.setAttribute("aria-label", "Remove color");

                color.addEventListener("input", (e) => { b.c = e.target.value.toUpperCase(); this.refresh(); });
                hexIn.addEventListener("input", () => { const v = parseHex(hexIn.value); if (v) { b.c = v; this.refresh(); } });
                hexIn.addEventListener("change", () => { hexIn.value = b.c.toUpperCase(); });
                hexIn.addEventListener("keydown", (e) => { if (e.key === "Enter") hexIn.blur(); });
                minus.addEventListener("click", () => { if (b.w > 1) { b.w--; this.refresh(); } });
                plus.addEventListener("click", () => { if (b.w < 99) { b.w++; this.refresh(); } });
                del.addEventListener("click", () => {
                    if (this.buckets.length > 1) {
                        this.buckets.splice(this.buckets.indexOf(b), 1);
                        this.buildBuckets(); this.refresh();
                    }
                });

                row.append(chip, name, parts, del);
                box.appendChild(row);
                return { chip, color, nm, hexIn, n };
            });
        }

        renderPalette() {
            const box = this.q(".cb-swatches");
            box.textContent = "";
            if (!this.palette.length) {
                const empty = document.createElement("span");
                empty.className = "cb-pal-empty";
                empty.textContent = "Nothing here yet — mix something and save it.";
                box.appendChild(empty);
            }
            for (const h of this.palette) {
                const b = document.createElement("button");
                b.type = "button";
                b.className = "cb-sw";
                b.style.background = h;
                b.title = "Copy " + h;
                b.setAttribute("aria-label", "Copy " + h);
                b.addEventListener("click", () => this.copy(h));
                box.appendChild(b);
            }
            this.q(".cb-copy-pal").hidden = !this.palette.length;
        }

        setMode(m, silent) {
            this.mode = m;
            this.q(".cb-pig").setAttribute("aria-pressed", String(m === "pigment"));
            this.q(".cb-rgb").setAttribute("aria-pressed", String(m === "rgb"));
            this.q(".cb-note").textContent = NOTE[m];
            if (!silent) this.refresh();
        }

        /** In-place value refresh — never touches DOM structure. */
        refresh() {
            for (const p of this._potEls) {
                const hit = this.buckets.filter((x) => x.c.toUpperCase() === p.hex.toUpperCase())[0];
                if (hit) p.el.setAttribute("data-n", hit.w); else p.el.removeAttribute("data-n");
            }
            this.buckets.forEach((b, i) => {
                const r = this._rowEls[i];
                if (!r) return;
                r.chip.style.background = b.c;
                if (r.color.value.toUpperCase() !== b.c.toUpperCase()) r.color.value = b.c;
                r.nm.textContent = potName(b.c);
                if (document.activeElement !== r.hexIn) r.hexIn.value = b.c.toUpperCase();
                r.n.textContent = b.w + (b.w === 1 ? " part" : " parts");
            });

            const main = this.mode === "pigment" ? mixPigment(this.buckets) : mixRGB(this.buckets);
            const other = this.mode === "pigment" ? mixRGB(this.buckets) : mixPigment(this.buckets);
            const result = this.q(".cb-result");
            result.style.background = main;
            // Contrast against a data colour, not against a theme — the mix can
            // be anything, so the ink is computed rather than tokenised.
            result.style.color = luma(main) > 0.35 ? "#181711" : "#F4F2EC";
            this.q(".cb-hex").textContent = main;
            this.q(".cb-cmp-chip").style.background = other;
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

            this.syncSwatches(this.q(".cb-harm-hues"), built.hues, "cb-hsw", false);
            this.syncSwatches(this.q(".cb-harm-neutrals"), built.neutrals, "cb-nsw", true);
            this.q(".cb-harm-why").textContent =
                built.sources.length + " pigments · every colour mixed from them";
        }

        /** Reconcile in place. Wiping and rebuilding these on every refresh
            would be the same mistake as rebuilding the recipe rows: refresh()
            runs on `input`, and churning DOM during a drag is what closes the
            native colour picker. Only the count ever changes structure. */
        syncSwatches(box, items, cls, captioned) {
            // lastElementChild, not lastChild: removing a stray text node would
            // not shrink .children, and the loop would never end.
            while (box.children.length > items.length) box.removeChild(box.lastElementChild);
            while (box.children.length < items.length) {
                const b = document.createElement("button");
                b.type = "button";
                b.className = cls;
                b.appendChild(document.createElement("span"));
                if (captioned) b.appendChild(document.createElement("small"));
                b.addEventListener("click", () => this.copy(b.dataset.hex));
                box.appendChild(b);
            }
            items.forEach((it, i) => {
                const b = box.children[i];
                b.dataset.hex = it.hex;
                b.firstChild.style.background = it.hex;
                if (captioned) b.lastChild.textContent = it.label;
                b.title = it.label + " — " + it.hex;
                b.setAttribute("aria-label", "Copy " + it.hex + ", " + it.label);
            });
        }

        copy(text) {
            const done = () => this.toast("Copied " + text);
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

        // sac.toast is the host's and optional: never assume chrome.
        /** Takes the finished message: not everything worth announcing is a copy. */
        toast(message) {
            if (typeof sac.toast === "function") { sac.toast(message, { kind: "success" }); return; }
            let el = this.q(".cb-toast");
            if (!el) {
                el = document.createElement("div");
                el.className = "cb-toast";
                el.setAttribute("role", "status");
                this.appendChild(el);
            }
            el.textContent = message;
            el.classList.add("on");
            clearTimeout(this._toastT);
            this._toastT = setTimeout(() => el.classList.remove("on"), 1400);
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
