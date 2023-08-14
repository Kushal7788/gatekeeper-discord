var { Check } = require("../../models/Check");
const { reclaimprotocol } = require("@reclaimprotocol/reclaim-sdk");
const reclaim = new reclaimprotocol.Reclaim();

const createObj = async () => {
	try {
		const check = new Check();
		check.data = {};
		await check.save();
		return check.checkId;
	} catch (err) {
		console.log(`err: ${err}`);
	}
};

const getReclaimUrlFunction = async (member, guildId, providerType) => {
	const checkId = await createObj();
	try {
		const check = await Check.findOne({ checkId: checkId });
		check.data = { memberId: member.user.id, guildId: guildId };
		await check.save();
		const request = reclaim.requestProofs({
			title: "Reclaim Protocol",
			baseCallbackUrl: process.env.BASE_URL + "/update/proof",
			callbackId: checkId,
			requestedProofs: [
				new reclaim.CustomProvider({
					provider: providerType,
					payload: {},
				}),
			],
		});
		const reclaimUrl = await request.getReclaimUrl();
		return reclaimUrl;
	} catch (err) {
		console.log(`error in getReclaimUrl: ${err}`);
	}
};

module.exports = { getReclaimUrlFunction };