const nodemailer = require('nodemailer');

// Create a test transporter (uses Ethereal for demo - no real email sent)
const createTransporter = async () => {
    // For demo/development, use Ethereal fake SMTP
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        }
    });
};

const sendAttendanceWarning = async (studentEmail, studentName, fatherEmail, phone, attendance, subject) => {
    try {
        const transporter = await createTransporter();

        const warningLevel = attendance < 60 ? 'CRITICAL' : 'WARNING';
        const color = attendance < 60 ? '#ef4444' : '#f59e0b';

        const htmlContent = `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f36100, #ff8533); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🎓 College Management System</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 4px 0 0;">Attendance Alert</p>
        </div>
        <div style="background: #1a1f35; padding: 24px; border-radius: 0 0 12px 12px; color: #f1f5f9;">
          <div style="background: ${color}20; border: 1px solid ${color}40; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <h2 style="color: ${color}; margin: 0 0 8px; font-size: 18px;">⚠️ ${warningLevel}: Low Attendance</h2>
            <p style="margin: 0; color: #94a3b8;">Student <strong style="color: #f1f5f9;">${studentName}</strong> has attendance below ${attendance < 60 ? '60%' : '75%'}</p>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #1e293b;">Student Name</td>
              <td style="padding: 10px 0; font-weight: 600; border-bottom: 1px solid #1e293b;">${studentName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #1e293b;">Subject</td>
              <td style="padding: 10px 0; font-weight: 600; border-bottom: 1px solid #1e293b;">${subject || 'Overall'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b;">Current Attendance</td>
              <td style="padding: 10px 0; font-weight: 700; color: ${color}; font-size: 20px;">${attendance}%</td>
            </tr>
          </table>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 20px;">
            ${attendance < 60
                ? 'This is a CRITICAL alert. The student may face detention if attendance is not improved immediately. Please contact the college administration.'
                : 'Please ensure regular attendance to avoid academic penalties. Contact the faculty advisor for any concerns.'
            }
          </p>
          <p style="color: #64748b; font-size: 11px; margin-top: 20px; text-align: center;">
            This is an automated message from the College Management System
          </p>
        </div>
      </div>
    `;

        // Send to student
        const studentMail = await transporter.sendMail({
            from: '"College Management System" <cms@college.com>',
            to: studentEmail,
            subject: `${warningLevel}: Attendance Alert - ${attendance}% attendance`,
            html: htmlContent
        });

        // Send to father/guardian if email available
        let parentMail = null;
        if (fatherEmail) {
            parentMail = await transporter.sendMail({
                from: '"College Management System" <cms@college.com>',
                to: fatherEmail,
                subject: `${warningLevel}: Your ward ${studentName} - Attendance Alert`,
                html: htmlContent
            });
        }

        // Log SMS simulation (in production, integrate with Twilio/MSG91)
        let smsInfo = null;
        if (phone) {
            smsInfo = {
                to: phone,
                message: `${warningLevel}: ${studentName}'s attendance is ${attendance}% in ${subject || 'overall'}. Please ensure regular attendance. - CMS`,
                status: 'simulated'
            };
            console.log(`[SMS SIMULATED] To: ${phone} - ${smsInfo.message}`);
        }

        return {
            success: true,
            studentMailPreview: nodemailer.getTestMessageUrl(studentMail),
            parentMailPreview: parentMail ? nodemailer.getTestMessageUrl(parentMail) : null,
            sms: smsInfo
        };
    } catch (error) {
        console.error('Email error:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendAttendanceWarning };
