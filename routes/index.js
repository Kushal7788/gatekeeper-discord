var express = require("express");
var router = express.Router();
var { Check } = require("../models/Check");
const bodyParser = require("body-parser");
const allProviderParams = require("./utils.json")
const { verifyMember } = require("../reclaim/utils/verify-member");

router.get("/", (request, response) => {
  response.status(200).json({
    success: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

router.post("/update/proof", bodyParser.text("*/*"), async (req, res) => {
  try {
    const check = await Check.findOne({ checkId: req.query.id });
    if (!check) return res.status(401).send("<h1>Unable to update Proof</h1>");
    check.data = {
      ...check.data,
      proofs: JSON.parse(Object.keys(req.body)[0]).proofs,
    };
    check.data = {
      ...check.data,
      proofParams: check.data.proofs.map((proof) => {
        if (allProviderParams.hasOwnProperty(proof.provider)) {
          const paramaters = JSON.parse(proof.parameters);
          let obj = {};
          obj["param"] = paramaters[allProviderParams[proof.provider]['param1']];
          return obj;
        }
        else {
          return JSON.parse(proof.parameters);
        }
      }),
    };
    check.data.proofParams = check.data.proofParams.reduce((result, currentObject) => {
      return { ...result, ...currentObject };
    }, {});
    await check.save();
    const verifyStatus = await verifyMember(check);
    if (verifyStatus) {
      res.status(201).send("<h1>Proofs has been shared with the Requestor. \n You can exit the screen</h1>");
    }
    else {
      res.status(401).send("<h1>Unable to verify the member</h1>");
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;