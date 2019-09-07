/**
 * By calling this function all selects will be replaced with custom selects
 * @param settingsJson {json} The time that should be waited before editing the width of elements
 *                            settingsJson.ms = 20          Sleep time of the width adjustment
 *                            settingsJson.two = true       Special case for only two select values
 */
function createSelectElements(settingsJson) {

    if (settingsJson === undefined) {
        settingsJson = {};
    }

    if (settingsJson.ms === undefined) {
        settingsJson.ms = 20;
    }

    if (settingsJson.two === undefined) {
        settingsJson.two = 20;
    }

    if (settingsJson["adjust-width"] === undefined) {
        settingsJson["adjust-width"] = true;
    }

    /**
     * Get the default value and default value text of the select element
     * @param {object} selectElement
     * @returns {json} json[value] json[valueText]
     */
    function getSelectInformation(selectElement) {
        // Get the default value of the select element
        let defaultValue = selectElement.value;

        let defaultValueText = "";

        let options = selectElement.getElementsByTagName("option");
        for (let i = 0; i < options.length; ++i) {
            // Get the text of the default value
            if (options[i].value === defaultValue) {
                defaultValueText = options[i].innerText;
            }
        }

        // Create the returnJson
        let returnJson = {};
        returnJson.value = defaultValue;
        returnJson.valueText = defaultValueText;

        return returnJson;
    }

    /**
     * Get the options and the corresponding text of one select and returns these in a json
     * @param optionElements {list} All option elements
     * @returns {json} json[i].value json[i].valueText
     */
    function getOptionInformation(optionElements) {

        let returnJson = {};
        // Go through every option and get the value of it
        for (let i = 0; i < optionElements.length; ++i) {
            returnJson[i] = {};
            returnJson[i].value = optionElements[i].value;
            returnJson[i].valueText = optionElements[i].innerText;
        }
        return returnJson;
    }

    /**
     * Get the label text if there is a label
     * @param labelElement {object} The label object
     * @returns {string | null} depending if there is a label
     */
    function getLabelInformation(labelElement) {
        let labelText = null;

        if (labelElement === undefined) {
            labelText = null;
        } else {
            labelText = labelElement.innerText;
        }
        return labelText;
    }

    // Get all selects which are in a custom-select div
    let selectElements = document.getElementsByClassName("custom-select");

    // The list where all custom selects are saved in
    let customSelectList = [];

    // Get and create all selects
    for (let i = 0; i < selectElements.length; ++i) {
        let rootElement = selectElements[i];
        let value = getSelectInformation(rootElement.getElementsByTagName("select")[0]);
        let optionList = getOptionInformation(rootElement.getElementsByTagName("option"));
        let labelText = getLabelInformation(rootElement.getElementsByTagName("label")[0]);

        let customSelect = new customSelectElement(value, optionList, labelText, rootElement, settingsJson.two);
        customSelect.createSelect();
        customSelectList.push(customSelect);
    }

    if (settingsJson["adjust-width"] === true) {
        // Adjust the size of the select elements
        adjustSize({"className": "select-label-button", "ms": settingsJson.ms});
        adjustSize({"className": "select-button", "ms": settingsJson.ms});
    }
}

/**
 * Custom select class
 */
class customSelectElement {
    /**
     * Constructor of the custom select
     * @param defaultValue The default value of the select
     * @param optionList The list of options with their value and text
     * @param labelContend The label text if there is one (non if not existend)
     * @param rootElement The element with the custom-select class
     * @param two Should there be a special case for two options
     */
    constructor(defaultValue, optionList, labelContend, rootElement, two) {
        this.isVisible = false;
        this.currentValue = defaultValue;
        this.optionList = optionList;
        this.defaultValue = defaultValue;
        this.labelContend = labelContend;
        this.rootElement = rootElement;
        this.two = two;
        this.optionCollection = null;
        this.closeFunction = this.closeSelect(this);
        this.changeFocus = this.changeFocus(this);
    }

    /**
     Create the select element
     */
    createSelect() {
        if (this.labelContend !== null) {
            // Create button group
            var buttonGroup = document.createElement("div");
            buttonGroup.classList.add("uk-button-group");
            buttonGroup.setAttribute("tabindex", "0");
            buttonGroup.addEventListener("keypress", this.toggleOptionList(this));

            // Create label button
            let labelButton = document.createElement("button");
            labelButton.setAttribute("class", "uk-button uk-button-small uk-button-default select-label-button");
            labelButton.setAttribute("tabindex", "-1");
            labelButton.innerText = this.labelContend;

            buttonGroup.appendChild(labelButton);
        }

        // Create the select button
        let selectButton = document.createElement("button");
        selectButton.setAttribute("class", "uk-button uk-button-small select-button uk-button-default " +
            "uk-flex uk-flex-middle uk-flex-between");
        selectButton.setAttribute("tabindex", "-1");
        selectButton.setAttribute("value", this.defaultValue.value);

        // Add the button text
        let buttonText = document.createElement("span");
        buttonText.classList.add("button-text");
        buttonText.innerText = this.defaultValue.valueText;
        selectButton.appendChild(buttonText);

        // Add the down icon
        let downIcon = document.createElement("span");
        downIcon.classList.add("select-button-icon");
        downIcon.setAttribute("uk-icon", "icon:triangle-down");
        selectButton.appendChild(downIcon);

        //Add the button either to the group or the custom select
        if (this.labelContend !== null) {
            buttonGroup.appendChild(selectButton);
            this.rootElement.appendChild(buttonGroup);
            selectButton.addEventListener("click", this.toggleOptionList(this));
        } else {
            selectButton.setAttribute("tabindex", "0");
            selectButton.classList.add("focusable");
            selectButton.addEventListener("click", this.toggleOptionList(this));
            // selectButton.addEventListener("keypress", this.toggleOptionList(this));
            this.rootElement.appendChild(selectButton);
        }

        // Create the select options
        this.optionCollection = document.createElement("div");
        this.optionCollection.setAttribute("class", "select-items select-hide");

        // Get every option in option list
        for (let i = 0; i < Object.keys(this.optionList).length; ++i) {
            // Create option div
            let optionDiv = document.createElement("div");
            optionDiv.setAttribute("value", this.optionList[i].value);
            optionDiv.innerText = this.optionList[i].valueText;
            optionDiv.setAttribute("tabindex", "0");

            if (this.optionList[i].value === this.currentValue.value) {
                optionDiv.setAttribute("selected", "");
            }

            // For the special case that there are only two elements in the select
            if (Object.keys(this.optionList).length === 2 && this.optionList[i].value === this.currentValue.value && this.two) {
                optionDiv.style.display = "none";
                optionDiv.setAttribute("select-hidden", "true");
            }

            // Add the click and keypress event listener
            optionDiv.addEventListener("click", customSelectElement.updateSelectOption(this));
            optionDiv.addEventListener("keypress", customSelectElement.updateSelectOption(this));

            // Append the option to the collection
            this.optionCollection.appendChild(optionDiv);
        }
        // Append the option collection
        this.rootElement.appendChild(this.optionCollection);
    }

    /**
     * Toggles the option list of a select
     * @param self {this} object of the customSelectElement
     * @returns {Function} The function that will be executed if the event is fired
     */
    toggleOptionList(self) {

        return function (evt) {

            if (evt !== undefined && evt.type === "keypress" && evt.code !== "Enter" ||
                evt !== undefined && evt.code === "Enter" && evt.timeStamp === self.eventTimeStamp) {
                return
            }

            if (self.isVisible === true) {
                document.removeEventListener("click", self.closeFunction);
                document.removeEventListener("keydown", self.closeFunction);
                document.addEventListener("keydown", self.changeFocus);

                self.optionCollection.classList.add("select-hide");
                self.isVisible = false;

            } else {
                // Set the position of the box
                self.optionCollection.style.left = getComputedStyle(self.rootElement).paddingLeft;
                self.optionCollection.style.right = getComputedStyle(self.rootElement).paddingRight;

                if (evt !== undefined) {
                    // Set the eventTimeStamp of the newest event
                    self.eventTimeStamp = evt.timeStamp;
                }

                let paddingTop = parseInt(getComputedStyle(self.rootElement).paddingTop.replace(/[g-x]/g, ""));
                let buttonGroupHeight = self.rootElement.getElementsByClassName("uk-button-group")[0].getBoundingClientRect().height;

                self.optionCollection.style.top = buttonGroupHeight + paddingTop + "px";

                self.optionCollection.classList.remove("select-hide");
                self.isVisible = true;

                document.addEventListener("click", self.closeFunction);
                document.addEventListener("keydown", self.closeFunction);
                document.addEventListener("keydown", self.changeFocus);
            }
        }
    }


    /**
     * Moves the focus up and down with the arrow keys
     * @param self {this} object of the customSelectElement
     * @returns {Function} The function that will be executed if the event is fired
     */
    changeFocus(self) {
        return function (evt) {

            if (evt.code === "ArrowDown" || evt.code === "ArrowUp") {
                
                // Get the element with the current focus
                let currentFocus = document.activeElement;
                // List of all elements that can be focused
                let focusableElementList = self.rootElement.querySelectorAll('[tabindex="0"]');
                let elementList = [];

                // Select only elements that are visible
                for (let i = 0; i < focusableElementList.length; ++i) {
                    if (!(focusableElementList[i].style.display === "none"))
                        elementList.push(focusableElementList[i]);
                }

                // Get the index of the current element in the list
                let index = 0;
                for (let i = 0; i < elementList.length; ++i) {
                    if (currentFocus === elementList[i]) {
                        index = i;
                    }
                }

                if (evt.code === "ArrowDown") {
                    if (index >= elementList.length - 1) {
                        // Bottom
                    } else {
                        elementList[index + 1].focus();
                    }
                } else if (evt.code === "ArrowUp") {
                    if (index === 0) {
                        // Top
                    } else {
                        elementList[index - 1].focus();
                    }
                }
            }
        }
    }


    /**
     * Update the select value
     * @param self {this} object of the customSelectElement
     * @returns {Function} The function that will be executed if the event is fired
     */
    static updateSelectOption(self) {
        return function (evt) {
            if (evt.type === "keypress" && evt.code !== "Enter") {
                return
            }

            evt.stopPropagation();
            evt.stopImmediatePropagation();

            self.toggleOptionList(self)();

            // Hide the not important element if there are only two selects
            if (Object.keys(self.optionList).length === 2 && self.two) {
                let options = self.optionCollection.getElementsByTagName("div");
                for (let i = 0; i < options.length; ++i) {
                    if (options[i].getAttribute("select-hidden") === "true") {
                        options[i].style.display = "block";
                        options[i].setAttribute("select-hidden", "false");
                    } else {
                        options[i].style.display = "none";
                        options[i].setAttribute("select-hidden", "true");
                    }
                }
            }

            // Get all options
            let options = self.optionCollection.getElementsByTagName("div");
            for (let i = 0; i < options.length; ++i) {
                // Find the currently selected and remove the selected class and attribute
                if (options[i].getAttribute("selected") === "") {
                    options[i].removeAttribute("selected");
                }
            }
            evt.currentTarget.setAttribute("selected", "");

            self.currentValue = evt.currentTarget.getAttribute("value");
            self.rootElement.getElementsByClassName("button-text")[0].innerText = self.valueToText(self.currentValue);
            self.rootElement.getElementsByTagName("select")[0].value = self.currentValue;
            self.rootElement.getElementsByTagName("select")[0].dispatchEvent(new Event("change"));
        }
    }

    /**
     * Close the custom select
     * @param self {this} object of the customSelectElement
     * @returns {Function} The function that will be executed if the event is fired
     */
    closeSelect(self) {
        return function (evt) {

            // If the event is no escape and the timestamp of the event was not already used
            if (evt.timeStamp === self.eventTimeStamp) {
                return
            }

            // If it is a key event
            if (evt.type === "keydown") {

                // If it is a different keycode than Escape and enter
                if (evt.code !== "Escape" && evt.code !== "Enter") {
                    return
                }

                // If the event is an enter and target of the enter is the button group let the button group handler handle things
                if (evt.target === self.rootElement.getElementsByClassName("uk-button-group")[0] && evt.code === "Enter") {
                    return
                }

                // If the event is an enter and target of the enter is the button group let the button group handler handle things
                if (evt.target === self.rootElement.getElementsByClassName("select-button")[0] && evt.code === "Enter" && self.labelContend === null) {
                    return
                }

                // If the event is a enter and the focus is on one of the options let the option handler handle things
                if (evt.code === "Enter") {
                    let optionList = self.optionCollection.getElementsByTagName("div");
                    for (let i = 0; i < optionList.length; ++i) {
                        if (evt.srcElement === optionList[i]) {
                            return
                        }
                    }
                }
            }
            self.toggleOptionList(self)();
        }
    }

    /**
     * Returns the text of a select element by inserting the value
     * @param value {string} value of the select element
     * @returns {string} Text of the value
     */
    valueToText(value) {
        let returnValueText = null;
        for (let i = 0; i < Object.keys(this.optionList).length; ++i) {
            if (this.optionList[i].value === value) {
                returnValueText = this.optionList[i].valueText;
                break;
            }
        }
        return returnValueText;
    }
}


/**
 * Adjust the size of the custom selects
 * @param settingsJson {json} Settings in json format
 * @returns {Promise<void>}
 */
async function adjustSize(settingsJson) {
    /**
     * Sleep function
     * @param ms Duration of the sleep in ms
     * @returns {Promise<*>}
     */
    async function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    if (settingsJson === undefined) {
        settingsJson = {};
    }

    if (settingsJson.ms === undefined) {
        settingsJson.ms = 20;
    }

    if (settingsJson.className === undefined) {
        settingsJson.className = "select-button"
    }


    // Await for uikit to add some styling
    await sleep(settingsJson.ms);
    let customSelectBoxes = document.getElementsByClassName(settingsJson.className);

    // Get the largest width
    let width = 0;
    for (let i = 0; i < customSelectBoxes.length; ++i) {
        if (customSelectBoxes[i].offsetWidth > width) {
            width = customSelectBoxes[i].offsetWidth;
        }
    }

    // Set the largest width for every element
    for (let i = 0; i < customSelectBoxes.length; ++i) {
        customSelectBoxes[i].style.minWidth = width + "px";
    }
}