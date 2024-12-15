import schedule from "node-schedule";
import { sendEmail } from "./email.js";

const sendReminder = (email, subject, message, time) => {
  schedule.scheduleJob(time, async () => {
    await sendEmail(email, subject, message);
  });
};

export { sendReminder };
