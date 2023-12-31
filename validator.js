// Đối tượng Validator
function Validator(options) {
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }
    var selectorRules = {}
    // hàm thực hiện validate
    function Validate(inputElement, rule) {
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        var errorMsg
        // lấy ra các rules của selector
        const rules = selectorRules[rule.selector]
        // lặp qua từng rule & kiểm tra
        // Nếu có lỗi thì dừng việc tra
        for (var i = 0; i < rules.length; ++i) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMsg = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default:
                    errorMsg = rules[i](inputElement.value);
            }
            errorMsg = rules[i](inputElement.value);
            if (errorMsg) break;
        }


        if (errorMsg) {
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
            errorElement.innerText = errorMsg
        } else {
            errorElement.innerText = ''
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');

        }
        return !errorMsg
    }
    // lấy element của form cần validate
    var formElement = document.querySelector(options.form);

    if (formElement) {
        // khi submit form
        formElement.onsubmit = function (e) {

            e.preventDefault();

            var isFormValid = true;
            // lặp qua từng rule và validate
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = Validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            })


            if (isFormValid) {
                // Trường hợp submit với js
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]')
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {

                        switch (input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break
                            case 'checkbox':
                                if (input.matches(':checked')) {
                                    values[input.name] = ''
                                    return values
                                }
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = []
                                }
                                values[input.name].push(input.value)
                                break
                            case 'file':
                                values[input.name] = input.files
                                break

                            default:
                                values[input.name] = input.value

                        }

                        return values
                    }, {})
                    options.onSubmit(formValues)
                }
                // Trường hợp submit với hành vi mặc định 
                else {
                    formElement.submit()

                }
            }
        }
        // lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur,input,...)
        options.rules.forEach(function (rule) {
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]
            }

            var inputElements = formElement.querySelectorAll(rule.selector);
            Array.from(inputElements).forEach(function (inputElement) {
                // xử lý trường hợp blur khỏi input
                inputElement.onblur = function () {
                    Validate(inputElement, rule);
                }
                // xử lý mỗi khi người dùng nhập vào input
                inputElement.oninput = function () {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
                    errorElement.innerText = ''
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                }
            })

        })
    }

}
// Định nghĩa rules
//  nguyên tắc các rules:
// 1. khi có lỗi thì => trả ra msg lỗi
// 2. khi ko có lỗi => ko trả ra cái j cả
Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : message || 'Vui lòng nhập trường này'
        }
    };
}
Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
            return regex.test(value) ? undefined : message || 'Email không đúng định dạng'
        }
    };
}

Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} ký tự!`
        }
    }
}
Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập không đúng'
        }
    }
}