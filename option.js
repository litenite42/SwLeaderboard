class Option {
	constructor(val = '', hasErr = false, msg = '', code = -1, defaultValue = -1) {
		this.value = val;
		this.hasError = hasErr;
		this.msg = msg;
		this.errorCode = code;
		this.default = defaultValue;
	}

	getValueWithOffset() {
		const result = {};

		result.value = this.value ? this.value : this.default;
		result.offset = !this.value;

		return result;
	}
}

module.exports = Option;
