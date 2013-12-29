var HTMLEncoder = function(){

	function encode(str, callback) {
		var i = str.length,
			aRet = [];

		while (i--) {
			var iC = str[i].charCodeAt();
			if ((iC < 65 || iC > 127 || (iC > 90 && iC < 97)) && (iC < 47 || iC > 58) && (iC != 20) && (iC != 32) && (iC != 64)) {
				aRet[i] = '&#' + iC + ';';
			} else {
				aRet[i] = str[i];
			}
		}
		callback(aRet.join(''));
	}

	return {
		encode: encode
	}
};

module.exports = HTMLEncoder;