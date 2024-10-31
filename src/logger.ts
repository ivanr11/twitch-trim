import util from "winston";

const logger = util.createLogger({
	level: "info",
	format: util.format.simple(),
	transports: [new util.transports.Console()],
});

export default logger;
