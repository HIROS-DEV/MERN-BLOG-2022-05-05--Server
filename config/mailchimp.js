const getRequestParams = (email) => {
	const API_KEY = process.env.MAILCHIMP_API_KEY;
	const LIST_ID = process.env.MAILCHIMP_LIST_ID;
	const DATACENTER = process.env.MAILCHIMP_API_KEY.split('-')[1];

	const url = `https://${DATACENTER}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`;

	const data = {
		email_address: email,
		status: 'pending',
	};

	const base64ApiKey = Buffer.from(`anystring:${API_KEY}`).toString(
		'base64'
	);
	const headers = {
		'Content-Type': 'application/json',
		Authorization: `Basic ${base64ApiKey}`,
	};

	return {
		url,
		data,
		headers,
	};
};

module.exports = getRequestParams;