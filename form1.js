function Validator(options) {
    var formElement = document.querySelector(options.form);
    var allFormRules = {};
    if (formElement) {
        options.rules.forEach(function(rule) {

            if (!Array.isArray(allFormRules[rule.selector])) {
                allFormRules[rule.selector] = [];
            }
            allFormRules[rule.selector].push(rule.test);

            var inputElements = formElement.querySelectorAll(rule.selector);
            inputElements.forEach((inputElement) => {
                if (inputElement) {
                    var errorElement = inputElement.closest(options.formGroup).querySelector(options.formMessage);
                    //Check user input
                    inputElement.onblur = () => {
                        validate(rule, inputElement, errorElement);
                    }
                    inputElement.onchange = () => {
                        validate(rule, inputElement, errorElement);
                    }
                    //Check user entering
                    inputElement.oninput = function() {
                        noErrorAndUserEntering(inputElement, errorElement);
                    }
                }
            });
        });
    }
    //Validate function
    function validate(rule, inputElement, errorElement) {
        var rules = allFormRules[rule.selector];
        var errorMessage;

        for (var i = 0; i < rules.length; ++i) {
            
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }

            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            inputElement.closest(options.formGroup).classList.add('invalid');
        } else {
            noErrorAndUserEntering(inputElement, errorElement);
        }

        return !errorMessage;
    }
    //Check no error and user entering function
    function noErrorAndUserEntering(inputElement, errorElement) {
        errorElement.innerText = '';
        inputElement.closest(options.formGroup).classList.remove('invalid');
    }
    //Check submit
    formElement.onsubmit = function(event) {
        event.preventDefault();
        var isFormValid = true;
        //Check all inputs filled in
        options.rules.forEach(function(rule) {
            var inputElement = formElement.querySelector(rule.selector);
            var errorElement = inputElement.closest(options.formGroup).querySelector(options.formMessage);
            var isValid = validate(rule, inputElement, errorElement);

            if (!isValid) {
                isFormValid = false;
            }
        });
        if (isFormValid) {
            if (typeof options.onSubmit === 'function') {
                var enableInputs = formElement.querySelectorAll('[name]');
                var valueInputs = Array.from(enableInputs).reduce((values, input) => {
                    
                    switch (input.type) {
                        case 'radio':
                            if (input.matches(':checked')) {
                                values[input.name] = input.value;
                            } else if (!values[input.name]) {
                                values[input.name] = '';
                            }
                            break;
                        case 'checkbox':
                            if (!values[input.name]) values[input.name] = '';
                            if (!input.matches(':checked')) return values;
                            if (!Array.isArray(values[input.name])) {
                                values[input.name] = [];
                            }
                            console.log(values[input.name])
                            values[input.name].push(input.value);
                            console.log(values[input.name])
                            break;
                        case 'file':
                            values[input.name] = input.files;
                            break;
                        default:
                            values[input.name] = input.value;
                    }

                    return values;
                }, {});
                options.onSubmit(valueInputs);
            } else {
                formElement.submit();
            }
        }
    }
}
//All the rules
//Name
Validator.isRequired = function(selector, message) {
    return {
        selector,
        test(value) {
            if (typeof value === 'string') {
                return value.trim() ? undefined : message || 'Vui lòng nhập trường này';
            }
            return value ? undefined : message || 'Vui lòng nhập trường này';
        }
    }
}
//Email
Validator.isEmail = function(selector, message) {
    return {
        selector,
        test(value) {
            //Chech email with check email regex https://www.w3resource.com/javascript/form/email-validation.php
            return (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) ? undefined : message || 'Trường này phải là email';
        }
    }
}
//Password
Validator.minLength = function(selector, min, getPasswordConfirmValue, message) {
    return {
        selector,
        test(value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập ít nhất ${min} kí tự`;
        }
    }
}
//Password confirm
Validator.isConfirmed = function(selector, getPasswordValue, message) {
    return {
        selector,
        test(value) {
            if (getPasswordValue().trim() !== '') {
                return value === getPasswordValue() ? undefined : message || 'Giá trị nhập vào không chính xác';
            } else {
                return 'Vui lòng nhập trường "Mật Khẩu"';
            }
        }
    }
}