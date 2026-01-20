const emailTamplates = {
  signupOTP: (otp) => ({
    subject: "Verify with OTP",
    body: `
        Dear User,

        Your One-Time Password (OTP) for completing your signup is: ${otp}

        Please enter this OTP to verify your account.
        Note: This code will expire in 10 minutes.

        Thank you for joining us!
        Best Regards,
        Via Menu 2.0 Team
    `,
  }),
};
export { emailTamplates };