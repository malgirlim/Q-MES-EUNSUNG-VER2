<template>
  <div class="main">
    <!-- Top bar -->
    <vue-file-toolbar-menu :content="menu" class="bar" style="width: 100%" />

    <!-- Document editor -->
    <vue-document-editor
      class="editor"
      ref="editor"
      v-model:content="content"
      :overlay="overlay"
      :zoom="zoom"
      :page_format_mm="page_format_mm"
      :page_margins="page_margins"
      :display="display"
    />
  </div>
</template>

<script lang="ts">
import VueFileToolbarMenu from "vue-file-toolbar-menu";
import VueDocumentEditor from "../../DocumentEditor/DocumentEditor.vue"; // set from 'vue-document-editor' in your application
import KPIReportTemplate from "./KPIReportTemplate.vue";
import { markRaw } from "vue";

export default {
  components: { VueDocumentEditor, VueFileToolbarMenu },

  props: {
    월별_데이터: Object,
    월별_OEE: Object,
    월별_목표: Object,
    selectYear: String,
  },

  data() {
    return {
      // This is where the pages content is stored and synced
      content: [
        {
          template: markRaw(KPIReportTemplate),
          props: {
            월별_데이터: Object.values(this.월별_데이터),
            월별_OEE: Object.values(this.월별_OEE),
            월별_목표: Object.values(this.월별_목표),
            selectYear: this.selectYear,
          },
        },
      ],
      zoom: 1,
      zoom_min: 0.1,
      zoom_max: 5.0,
      page_format_mm: [210, 297],
      page_margins: "15mm",
      display: "grid", // ["grid", "vertical", "horizontal"]
      mounted: false, // will be true after this component is mounted
      undo_count: -1, // contains the number of times user can undo (= current position in content_history)
      content_history: [], // contains the content states for undo/redo operations
    };
  },

  created() {
    // Initialize gesture flags
    let start_zoom_gesture: any = false;
    let start_dist_touch: any = false;
    let start_zoom_touch: any = false;

    // Manage ctrl+scroll zoom (or trackpad pinch)
    window.addEventListener(
      "wheel",
      (e) => {
        if (e.ctrlKey) {
          e.preventDefault();
          this.zoom = Math.min(
            Math.max(this.zoom - e.deltaY * 0.01, this.zoom_min),
            this.zoom_max
          );
        }
      },
      { passive: false }
    );

    // Manage trackpad pinch on Safari
    window.addEventListener("gesturestart", (e) => {
      e.preventDefault();
      start_zoom_gesture = this.zoom;
    });
    window.addEventListener("gesturechange", (e) => {
      e.preventDefault();
      if (!start_zoom_touch) {
        this.zoom = Math.min(
          Math.max(start_zoom_gesture * e.scale, this.zoom_min),
          this.zoom_max
        );
      }
    });
    window.addEventListener("gestureend", () => {
      start_zoom_gesture = false;
    });

    // Manage pinch to zoom for touch devices
    window.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length == 2) {
          e.preventDefault();
          start_dist_touch = Math.hypot(
            e.touches[0].pageX - e.touches[1].pageX,
            e.touches[0].pageY - e.touches[1].pageY
          );
          start_zoom_touch = this.zoom;
        }
      },
      { passive: false }
    );
    window.addEventListener(
      "touchmove",
      (e) => {
        if (start_dist_touch && start_zoom_touch) {
          e.preventDefault();
          let zoom =
            (start_zoom_touch *
              Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
              )) /
            start_dist_touch;
          this.zoom = Math.min(Math.max(zoom, this.zoom_min), this.zoom_max);
        }
      },
      { passive: false }
    );
    window.addEventListener(
      "touchend",
      () => {
        start_dist_touch = false;
        start_zoom_touch = false;
      },
      { passive: false }
    );

    // Manage history undo/redo events
    const manage_undo_redo = (e) => {
      switch (e && e.inputType) {
        case "historyUndo":
          e.preventDefault();
          e.stopPropagation();
          this.undo();
          break;
        case "historyRedo":
          e.preventDefault();
          e.stopPropagation();
          this.redo();
          break;
      }
    };
    window.addEventListener("beforeinput", manage_undo_redo);
    window.addEventListener("input", manage_undo_redo); // in case of beforeinput event is not implemented (Firefox)

    // If your component is susceptible to be destroyed, don't forget to
    // use window.removeEventListener in the Vue.js beforeUnmount handler
  },

  mounted() {
    this.mounted = true;
  },

  computed: {
    // This is the menu content
    menu() {
      return [
        // Main commands

        {
          text: "출력",
          title: "Print",
          icon: "print",
          click: () => window.print(),
        },

        // Undo / redo commands

        { is: "spacer" },

        {
          // Margins menu
          text: this.current_margins_name,
          title: "Margins",
          icon: "select_all",
          chevron: true,
          menu: this.margins.map(([text, value]) => {
            return {
              text: text + " (" + value + ")",
              active: this.page_margins == value,
              click: () => {
                this.page_margins = value;
              },
            };
          }),
          menu_width: 200,
          menu_class: "align-center",
        },
        {
          // Zoom menu
          text: Math.floor(this.zoom * 100) + "%",
          title: "Zoom",
          icon: "zoom_in",
          chevron: true,
          menu: [
            ["200%", 2.0],
            ["150%", 1.5],
            ["125%", 1.25],
            ["100%", 1.0],
            ["75%", 0.75],
            ["50%", 0.5],
            ["25%", 0.25],
          ].map(([text, zoom]) => {
            return {
              text,
              active: this.zoom == zoom,
              click: () => {
                this.zoom = zoom;
              },
            };
          }),
          menu_width: 80,
          menu_height: 280,
          menu_class: "align-center",
        },
      ];
    },

    // Formats management
    current_format_name() {
      const format = this.formats.find(
        ([, width_mm, height_mm]) =>
          this.page_format_mm[0] == width_mm &&
          this.page_format_mm[1] == height_mm
      );
      return format
        ? format[0]
        : this.page_format_mm[0] + "mm x " + this.page_format_mm[1] + "mm";
    },
    formats: () => [
      ["A0", 841, 1189],
      ["A0L", 1189, 841],
      ["A1", 594, 841],
      ["A1L", 841, 594],
      ["A2", 420, 594],
      ["A2L", 594, 420],
      ["A3", 297, 420],
      ["A3L", 420, 297],
      ["A4", 210, 297],
      ["A4L", 297, 210],
      ["A5", 148, 210],
      ["A5L", 210, 148],
      ["A6", 105, 148],
      ["A6L", 148, 105],
    ],

    // Margins management
    current_margins_name() {
      const margins = this.margins.find(
        ([, margins]) => this.page_margins == margins
      );
      return margins ? margins[0] : this.page_margins;
    },
    margins: () => [
      ["넓게", "20mm"],
      ["기본", "15mm"],
      ["좁게", "10mm"],
      ["매우좁게", "5mm"],
    ],

    // Current text style management
    current_text_style() {
      return this.mounted ? this.$refs.editor.current_text_style : false;
    },
    isLeftAligned() {
      return ["start", "left", "-moz-left"].includes(
        this.current_text_style.textAlign
      );
    },
    isRightAligned() {
      return ["end", "right", "-moz-right"].includes(
        this.current_text_style.textAlign
      );
    },
    isCentered() {
      return ["center", "-moz-center"].includes(
        this.current_text_style.textAlign
      );
    },
    isJustified() {
      return ["justify", "justify-all"].includes(
        this.current_text_style.textAlign
      );
    },
    isBold() {
      const fontWeight = this.current_text_style.fontWeight;
      return (
        fontWeight &&
        (parseInt(fontWeight) > 400 || fontWeight.indexOf("bold") == 0)
      );
    },
    isItalic() {
      return this.current_text_style.fontStyle == "italic";
    },
    isUnderline() {
      // text-decoration is not overridden by children, so we query the parent stack
      const stack = this.current_text_style.textDecorationStack;
      return stack && stack.some((d) => d.indexOf("underline") == 0);
    },
    isStrikeThrough() {
      // text-decoration is not overridden by children, so we query the parent stack
      const stack = this.current_text_style.textDecorationStack;
      return stack && stack.some((d) => d.indexOf("line-through") == 0);
    },
    isNumberedList() {
      return (
        this.current_text_style.isList &&
        this.current_text_style.listStyleType == "decimal"
      );
    },
    isBulletedList() {
      return (
        this.current_text_style.isList &&
        ["disc", "circle"].includes(this.current_text_style.listStyleType)
      );
    },
    isH1() {
      return this.current_text_style.headerLevel == 1;
    },
    isH2() {
      return this.current_text_style.headerLevel == 2;
    },
    isH3() {
      return this.current_text_style.headerLevel == 3;
    },
    curColor() {
      return this.current_text_style.color || "transparent";
    },

    // Platform management
    isMacLike: () => /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform),

    // Undo / redo flags
    can_undo() {
      return this.undo_count > 0;
    },
    can_redo() {
      return this.content_history.length - this.undo_count - 1 > 0;
    },
  },

  methods: {
    // Page overlays (headers, footers, page numbers)
    overlay(page, total) {
      // Add page numbers on each page
      let html =
        '<div style="position: absolute; bottom: 8mm; right: 10mm">페이지 ' +
        page +
        " / " +
        total +
        "</div>";

      // Add custom headers and footers from page 3
      // if (page >= 3) {
      //   html +=
      //     '<div style="position: absolute; left: 0; top: 0; right: 0; padding: 3mm 5mm; background: rgba(200, 220, 240, 0.5)"><strong>MYCOMPANY</strong> example.com /// This is a custom header overlay</div>';
      //   html +=
      //     '<div style="position: absolute; left: 10mm; right: 10mm; bottom: 5mm; text-align:center; font-size:10pt">MY COMPANY - example.com /// This is a custom footer overlay</div>';
      // }
      return html;
    },

    // Undo / redo functions examples
    undo() {
      if (this.can_undo) {
        this._mute_next_content_watcher = true;
        this.content = this.content_history[--this.undo_count];
      }
    },
    redo() {
      if (this.can_redo) {
        this._mute_next_content_watcher = true;
        this.content = this.content_history[++this.undo_count];
      }
    },
    resetContentHistory() {
      this.content_history = [];
      this.undo_count = -1;
    },

    // Insert page break function example
    async insertPageBreak() {
      // insert paragraph at caret position
      document.execCommand("insertParagraph");

      // insert a marker at caret position (start of the new paragraph)
      const marker = "###PB###"; // must be regex compatible
      document.execCommand("insertText", false, marker);

      // wait for v-model content update (two ticks are needed to reactivate watch on content)
      await this.$nextTick();
      await this.$nextTick();

      // find the marker inside content items and split this content item in two items between the two paragraphs
      // only match root tags (p, div, h1, h2...) to avoid non-root tags like <li>
      const regexp = new RegExp("<(p|div|h\\d)( [^/>]+)*>(<[^/>]+>)*" + marker);
      for (let i = 0; i < this.content.length; i++) {
        const item = this.content[i];
        if (typeof item != "string") continue;
        const match = regexp.exec(item);
        if (match) {
          const tags_open = match[0].slice(0, -marker.length);
          let content_plus_tags_close = item.substr(
            match.index + match[0].length
          );
          // insert <br> to empty pages that would not be handled correctly by contenteditable
          if (content_plus_tags_close.indexOf("</") == 0)
            content_plus_tags_close = "<br>" + content_plus_tags_close;
          this.content.splice(
            i,
            1,
            item.substr(0, match.index),
            tags_open + content_plus_tags_close
          );
          return;
        }
      }

      // if the code didn't return before, the split didn't work (e.g. inside a <li>). just remove the marker from the content
      for (let i = 0; i < this.content.length; i++) {
        const item = this.content[i];
        if (typeof item != "string" || item.indexOf(marker) < 0) continue;
        this.content.splice(i, 1, item.replace(marker, ""));
        break;
      }
    },
  },

  watch: {
    content: {
      immediate: true,
      // Fill undo / redo history stack on user input
      handler(new_content) {
        if (!this._mute_next_content_watcher) {
          // only update the stack when content is changed by user input, not undo/redo commands
          this.content_history[++this.undo_count] = new_content;
          this.content_history.length = this.undo_count + 1; // remove all redo items
        }
        this._mute_next_content_watcher = false;
      },
    },
  },
};
</script>

<style>
html {
  height: 100%;
}
body {
  margin: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: black;
  /*background: rgb(248, 249, 250);*/
}
::-webkit-scrollbar {
  width: 16px;
  height: 16px;
}
::-webkit-scrollbar-track,
::-webkit-scrollbar-corner {
  display: none;
}
::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.5);
  border: 5px solid transparent;
  border-radius: 16px;
  background-clip: content-box;
}
::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.8);
}
</style>

<style scoped>
.main {
  width: fit-content;
  min-width: 100%;
}
.bar {
  position: sticky;
  left: 0;
  top: 0;
  width: calc(100vw - 16px);
  z-index: 1000;
  background: rgba(248, 249, 250, 0.8);
  border-bottom: solid 1px rgb(248, 249, 250);
  backdrop-filter: blur(10px);
  --bar-button-active-color: #188038;
  --bar-button-open-color: #188038;
  --bar-button-active-bkg: #e6f4ea;
  --bar-button-open-bkg: #e6f4ea;
}
</style>
