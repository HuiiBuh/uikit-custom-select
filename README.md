# Custom Select with UIkit
Creates a custom select with [UIkit](google.com). 

## General

Add the css and the js file to your page and call the `createSelectElements` function at the point you want to create the custom select. I recommend after the JS of Uikit.  

There are two parameters that you can give the function.

```json
  {
    "adjust-width": true,
    "ms": 20,
    "two": true
  }
```
+ The parameter `adjust-width` lets you customize if the selects should have the same width. Use either true of false.  
+ The `ms` parameter is a parameter that lets the script wait a certain amount of ms before it adjusts the size of the input boxes.
The default value is 20ms. You can turn the delay of by using a value of 0. In this case the width of all the selects may not be the same, because UIkit loads loads the icons after the execution of this script.  
+ The two parameter lets you choos if there will be a special case for selects with only two values. If you let the value be the default (true) the currently selected value will not be displayed. Only the other value will be visible in the select dropdown.  

You can focus the elements with `tab` just like you would normally do. If you focus a element you can press `enter`. This will result in the same action as if you would have clicked the element. 



## Usage

To create a custom select add the class `custom-select` to a `div`. Inside of this `div` create the select element with the different options.  
It is crucial that you add a `selected` tag to the default value of the select and that every option has a value.  
The label element is optional as well as the uk-padding-middle class.

```html
<div class="custom-select uk-padding-middle">
    <select>
        <option value="audio" selected>Audio</option>
        <option value="video">Video</option>
    </select>
    <label>Format</label>
</div>
```
If the value of the select changes a `change` event gets fired. This is the only event you get from the orginal select. If you want to have the value of the select just use the value of the select you created. It is not visible, but the value is always up to date.

## Result

Select with tow options (one allready selected and therefore not visible anymore).
![TwoOptionDropdown](https://i.imgur.com/Ljlcd3E.png)

A select with more than two options. The selected option is highlighted. 

![MultibleOptions](https://i.imgur.com/F2HG19k.png)

Select without a label.

![WithoutLabel](https://i.imgur.com/8KqQr7S.png)
