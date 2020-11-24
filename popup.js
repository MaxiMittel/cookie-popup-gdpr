/*
 * Cookie Popup
 * https://github.com/MaxiMittel/cookie-popup
 *
 * Copyright (c) 2020 Maximilian Mittelhammer
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE', which is part of this source code package.
 */

class CookiePopup {
  /**
   * Initializes config parameters and creates the containers.
   * @param {object} config
   */
  constructor(config) {
    //Initilize config
    this.config = {
      heading: config.heading || "This website contains cookies",
      informationText: config.informationText || "General description",
      checkboxes: config.checkboxes || defaultCheckboxes,
      tableHeads: config.tableHeads || ["Name", "Description"],
      buttons: config.buttons || defaultButtons,
      callback: config.callback || defaultCallback,
      style: config.style || "https://cdn.jsdelivr.net/gh/MaxiMittel/cookie-popup/popup.min.css",
      position: config.position || "top-right",
      savePref: config.savePref || true,
      savePrefDefault: config.savePrefDefault || true
    };

    //Check if preferences are set
    if (localStorage.getItem("gdpr-preferences") !== null) {
      this.config.callback(
        JSON.parse(localStorage.getItem("gdpr-preferences"))
      );
      return;
    }

    //Load the styles
    this.loadStylesheet();

    //Create the container and the popup
    let container = document.body;
    let blurred_bg = this.createBlurredBackground();
    container.appendChild(blurred_bg);
    let popup = this.createPopupContainer();
    container.appendChild(popup);

    //Configure the form
    let form = document.createElement("form");
    form.onsubmit = (e) => {
      e.preventDefault();

      //create the result object
      let res = [];
      for (let i = 0; i < this.config.checkboxes.length; i++) {
        res.push({
          checked: document.getElementsByName(this.config.checkboxes[i].name)[0]
            .checked,
          services: this.config.checkboxes[i].services,
        });
      }

      this.config.callback(res);

      //Save the preferences
      if(this.config.savePref) localStorage.setItem("gdpr-preferences", JSON.stringify(res));

      //Remove the popup from the DOM
      document.body.removeChild(blurred_bg);
      document.body.removeChild(popup);
    };

    //Create the checkboxes
    for (let i = 0; i < this.config.checkboxes.length; i++) {
      let item = this.config.checkboxes[i];
      form.appendChild(
        this.createExpandContainer(
          item.title,
          item.name,
          item.description,
          item.required,
          item.checked,
          item.services
        )
      );
    }

    if(this.config.savePref) form.appendChild(this.createSavePref());
    form.appendChild(this.createButtonGroup(this.config.buttons));
    popup.appendChild(form);
  }

  /**
   * Checks whether the stylesheet has already been
   * loaded if not loads it.
   */
  loadStylesheet = () => {
    var stylesheet = "gdpr-popup-stylesheet";
    if (!document.getElementById(stylesheet)) {
      var head = document.getElementsByTagName("head")[0];
      var link = document.createElement("link");
      link.id = stylesheet;
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = this.config.style;
      link.media = "all";
      head.appendChild(link);
    }
  };

  /**
   * Creates the blurred background.
   */
  createBlurredBackground = () => {
    let blurred_background = document.createElement("div");
    blurred_background.classList.add("gdpr-popup-blurred-background");
    return blurred_background;
  };

  /**
   * Create the actual popup.
   */
  createPopupContainer = () => {
    let popup_container = document.createElement("div");
    popup_container.classList.add("gdpr-popup-container");
    popup_container.classList.add("gdpr-popup-position-" + this.config.position);

    //Heading
    let heading = document.createElement("h3");
    heading.classList.add("gdpr-popup-heading");
    heading.innerText = this.config.heading;
    popup_container.appendChild(heading);

    //Information
    let information_text = document.createElement("p");
    information_text.classList.add("gdpr-popup-text");
    information_text.innerText = this.config.informationText;
    popup_container.appendChild(information_text);

    return popup_container;
  };

  /**
   * Create a checkbox with expandable services table.
   * @param {string} title The label for the checkbox.
   * @param {string} name The name attribute of the checkbox.
   * @param {string} description A general description of the purpose for this cookie category.
   * @param {boolean} required If set disables the checkbox overrides 'checked' to true.
   * @param {boolean} checked Determines the default state of the checkbox.
   * @param {array} services A two dimensional array of services.
   */
  createExpandContainer = (
    title,
    name,
    description,
    required,
    checked,
    services
  ) => {
    let checkbox_container = document.createElement("div");

    //Checkbox Title Information
    let checkbox_heading_container = document.createElement("div");
    checkbox_heading_container.classList.add(
      "gdpr-popup-checkbox-heading-container"
    );

    //Checkbox
    let checkbox_id = this.makeID("gdpr-popup-checkbox");
    let checkbox_input = document.createElement("input");
    checkbox_input.setAttribute("type", "checkbox");
    checkbox_input.checked = checked;

    if (required) {
      checkbox_input.checked = true;
      checkbox_input.disabled = required;
    }

    checkbox_input.setAttribute("name", name);
    checkbox_input.classList.add("gdpr-popup-checkbox");
    checkbox_input.id = checkbox_id;
    checkbox_input.name = name;
    checkbox_heading_container.appendChild(checkbox_input);

    //Title
    let checkbox_label = document.createElement("label");
    checkbox_label.setAttribute("for", checkbox_id);
    checkbox_label.innerText = title;
    checkbox_label.classList.add("gdpr-popup-expand-heading");
    checkbox_heading_container.appendChild(checkbox_label);

    //Information icon
    let expand_id = this.makeID("gdpr-popup-expand");
    let info_img = document.createElement("img");
    info_img.classList.add("gdpr-popup-expand-info");
    info_img.src = info_svg;
    info_img.onclick = () => {
      let expandElement = document.getElementById(expand_id);

      if (expandElement.getAttribute("isHidden") === "true") {
        expandElement.style.display = "block";
        expandElement.setAttribute("isHidden", "false");
      } else {
        expandElement.style.display = "none";
        expandElement.setAttribute("isHidden", "true");
      }
    };
    checkbox_heading_container.appendChild(info_img);

    checkbox_container.appendChild(checkbox_heading_container);

    //Expand container
    let expand_container = document.createElement("div");
    expand_container.setAttribute("isHidden", "true");
    expand_container.style.display = "none";
    expand_container.classList.add("gdpr-popup-expand-container");
    expand_container.id = expand_id;
    checkbox_container.appendChild(expand_container);

    //Description
    let description_elem = document.createElement("p");
    description_elem.innerText = description;
    description_elem.classList.add("gdpr-popup-text");
    expand_container.appendChild(description_elem);

    //Services table
    let table = document.createElement("table");
    table.classList.add("gdpr-popup-table");
    expand_container.appendChild(table);

    //Table head
    let table_head = document.createElement("thead");
    let table_head_row = document.createElement("tr");
    table_head.appendChild(table_head_row);
    table.appendChild(table_head);

    for (let i = 0; i < this.config.tableHeads.length; i++) {
      let table_head = document.createElement("th");
      table_head.innerText = this.config.tableHeads[i];
      table_head_row.appendChild(table_head);
    }

    //table body
    let table_body = document.createElement("tbody");
    for (let i = 0; i < services.length; i++) {
      let tabel_body_row = document.createElement("tr");
      for (let j = 0; j < services[i].length; j++) {
        let tabel_body_row_entry = document.createElement("td");
        tabel_body_row_entry.innerText = services[i][j];
        tabel_body_row.appendChild(tabel_body_row_entry);
      }
      table_body.appendChild(tabel_body_row);
    }
    table.appendChild(table_body);

    return checkbox_container;
  };

  /**
   * Create the save preferences checkbox.
   */
  createSavePref = () =>{

    let container = document.createElement("div");

    //Checkbox
    let checkbox_input = document.createElement("input");
    let checkbox_id = "gdpr-popup-save-pref-checkbox";
    checkbox_input.setAttribute("type", "checkbox");
    checkbox_input.classList.add("gdpr-popup-save-pref-checkbox");
    checkbox_input.id = checkbox_id;
    checkbox_input.checked = this.config.savePrefDefault;
    checkbox_input.onchange = () => {
      this.config.savePref = !this.config.savePref;
    };
    container.appendChild(checkbox_input);

    //Title
    let checkbox_label = document.createElement("label");
    checkbox_label.setAttribute("for", checkbox_id);
    checkbox_label.innerText = "Save preferences on this computer.";
    checkbox_label.classList.add("gdpr-popup-save-pref-label");
    container.appendChild(checkbox_label);

    return container;
  }

  /**
   * Creates the buttons at the bottom of the popup.
   * @param {array} buttons An array of button definitions.
   */
  createButtonGroup = (buttons) => {
    let button_group_container = document.createElement("div");
    button_group_container.classList.add("gdpr-popup-btn-container");

    for (let i = 0; i < buttons.length; i++) {
      let button = document.createElement("button");
      button.classList.add("gdpr-popup-btn");

      if (buttons[i].hasOwnProperty("green")) {
        button.classList.add("gdpr-popup-btn-green");
      }

      button.innerText = buttons[i].title;
      button.onclick = buttons[i].onclick;
      button.setAttribute("type", "submit");
      button_group_container.appendChild(button);
    }

    return button_group_container;
  };

  /**
   * Creates a random id.
   * @param {string} prefix A string placed before the random id.
   */
  makeID = (prefix) => {
    return prefix + "_" + Math.random().toString(36).substr(2, 9);
  };
}

// #### Defaults config values ####
let defaultCheckboxes = [
  {
    title: "No checkboxes defined",
    required: true,
    checked: true,
    name: "undefinedCheckboxes",
    description: "Gerneral description",
    services: [["Service name.", "Service description."]],
  },
];

let defaultButtons = [
  {
    title: "No buttons defined",
    onclick: () => {},
  },
];

let defaultCallback = (res) => console.log(res);

/**
 * Sets the checked attribute to true on all passed checkboxes. (Checkbox name attribute)
 * @param {array} arguments Pass a undefined amount of checkbox names.
 */
function check() {
  for (var i = 0; i < arguments.length; i++) {
    document.getElementsByName(arguments[i])[0].checked = true;
  }
}

/**
 * Sets the checked attribute to false on all passed checkboxes. (Checkbox name attribute)
 * @param {array} arguments Pass a undefined amount of checkbox names.
 */
function uncheck() {
  for (var i = 0; i < arguments.length; i++) {
    document.getElementsByName(arguments[i])[0].checked = false;
  }
}

let info_svg =
  "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMzVweCIgaGVpZ2h0PSIzNXB4IiB2aWV3Qm94PSIwIDAgMzUgMzUiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8dGl0bGU+SW5mb3JtYXRpb248L3RpdGxlPgogICAgPGcgaWQ9IlBhZ2UtMSIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9IkluZm9ybWF0aW9uIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxLjAwMDAwMCwgMS4wMDAwMDApIiBzdHJva2U9IiMwMDAwMDAiPgogICAgICAgICAgICA8Y2lyY2xlIGlkPSJPdmFsIiBzdHJva2Utd2lkdGg9IjIiIGN4PSIxNi41IiBjeT0iMTYuNSIgcj0iMTYuNSI+PC9jaXJjbGU+CiAgICAgICAgICAgIDxsaW5lIHgxPSIxNi41IiB5MT0iMTYuNSIgeDI9IjE2LjUiIHkyPSIyNi41IiBpZD0iTGluZSIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjwvbGluZT4KICAgICAgICAgICAgPGNpcmNsZSBpZD0iT3ZhbCIgZmlsbD0iIzAwMDAwMCIgY3g9IjE2LjUiIGN5PSI5LjUiIHI9IjIiPjwvY2lyY2xlPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+";
