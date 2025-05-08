import * as  nodemailer from 'nodemailer';
import { EmailFormDto, EmailFormSchema, EmailTemplateDto } from './email.dtos';
import { logger } from '@app/utils';

type TemplateTypes = "modern" | "business" | "creative"

export class EmailService {
  private transporter: nodemailer.Transporter;
  private templates: Map<TemplateTypes, EmailTemplateDto>;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: false,
      auth: {
        // user: 'genzoutcast0@gmail.com',
        // pass: '68205-Zufi',
        clientId: '64898343756-b35i3i7e82el14csepngun21o8t2p9a0.apps.googleusercontent.com',
        clientSecret: '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',
      }
    });

    this.templates = this.initializeTemplates();
  }

  public getTemplates(): EmailTemplateDto[] {
    return Array.from(this.templates.values());
  }

  public async sendEmail(
    templateId: TemplateTypes,
    data: EmailFormDto,
    from: string = 'zufichris@gmail.com'
  ): Promise<boolean> {
    try {
      EmailFormSchema.parse(data);
      const template = this.templates.get(templateId) || this.templates.get("modern")
      const subject = template?.subject.replace('{{name}}', data.name);

      const html = template?.html(data);

      const ukar = await this.transporter.sendMail({
        from,
        to: 'genzoutcast0@gmail.com',
        subject,
        html
      })
      logger.info("Email Sent", ukar)
      return true;
    } catch (error) {
      logger.error("Error Sending Mail", { error });
      throw error
    }
  }
  public previewTemplate(templateId: TemplateTypes, data: EmailFormDto): string | null {
    const template = this.templates.get(templateId);

    if (!template) {
      return null;
    }

    return template.html(data);
  }
  private initializeTemplates() {
    const templates = new Map<TemplateTypes, EmailTemplateDto>()
    templates.set('modern', {
      id: 'modern-purple',
      name: 'Modern Purple',
      subject: 'New Project Inquiry from {{name}}',
      colors: {
        primary: '#8e00bb',
        secondary: '#26d9ff',
        accent: '#9982dc'
      },
      html: (data: EmailFormDto) => `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
            }
            .header {
              background-color: ${templates.get('modern')?.colors.primary};
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              padding: 20px;
              border: 1px solid #ddd;
              border-top: none;
              border-radius: 0 0 5px 5px;
            }
            .highlight {
              color: ${templates.get('modern')?.colors.accent};
              font-weight: bold;
            }
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 12px;
              color: #888;
            }
            .button {
              display: inline-block;
              background-color: ${templates.get('modern')?.colors.secondary};
              color: white;
              padding: 10px 20px;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>New Project Inquiry</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>You have received a new project inquiry from <span class="highlight">${data.name}</span>.</p>
            <p><strong>Contact Details:</strong></p>
            <ul>
              <li>Name: ${data.name}</li>
              <li>Email: ${data.email}</li>
              <li>Phone: ${data.phone}</li>
            </ul>
            <p><strong>Project Description:</strong></p>
            <p>${data.projectDescription}</p>
            <a href="mailto:${data.email}" class="button">Reply to Inquiry</a>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply directly to this email.</p>
          </div>
        </body>
        </html>
      `
    });
    templates.set('business', {
      id: 'business-blue',
      name: 'Business Blue',
      subject: 'Project Request from {{name}}',
      colors: {
        primary: '#26d9ff',
        secondary: '#8e00bb',
        accent: '#9982dc'
      },
      html: (data: EmailFormDto) => `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              background-color: #f9f9f9;
            }
            .container {
              background-color: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
              background-color: ${templates.get('business')?.colors.primary};
              color: #333;
              padding: 20px;
              text-align: center;
            }
            .content {
              padding: 30px;
            }
            .field {
              margin-bottom: 15px;
            }
            .field-label {
              font-weight: bold;
              color: ${templates.get('business')?.colors.secondary};
              display: block;
              margin-bottom: 5px;
            }
            .field-value {
              background-color: #f5f5f5;
              padding: 8px;
              border-radius: 4px;
              border-left: 3px solid ${templates.get('business')?.colors.accent};
            }
            .project-description {
              margin-top: 20px;
              padding: 15px;
              background-color: #f5f5f5;
              border-radius: 4px;
            }
            .footer {
              background-color: #f5f5f5;
              padding: 15px;
              text-align: center;
              font-size: 12px;
              color: #888;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Project Request</h1>
            </div>
            <div class="content">
              <p>A new project request has been submitted with the following details:</p>
              
              <div class="field">
                <span class="field-label">Name:</span>
                <div class="field-value">${data.name}</div>
              </div>
              
              <div class="field">
                <span class="field-label">Email:</span>
                <div class="field-value">${data.email}</div>
              </div>
              
              <div class="field">
                <span class="field-label">Phone:</span>
                <div class="field-value">${data.phone}</div>
              </div>
              
              <div class="field">
                <span class="field-label">Project Description:</span>
                <div class="project-description">${data.projectDescription}</div>
              </div>
            </div>
            <div class="footer">
              <p>This is an automated notification. Please contact the sender directly.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
    templates.set('creative', {
      id: 'creative',
      name: 'Creative Purple',
      subject: 'Creative Project Submission - {{name}}',
      colors: {
        primary: '#9982dc',
        secondary: '#8e00bb',
        accent: '#26d9ff'
      },
      html: (data: EmailFormDto) => `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Roboto', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              background-color: #f0f0f0;
            }
            .card {
              background-color: white;
              border-radius: 15px;
              overflow: hidden;
              box-shadow: 0 5px 25px rgba(0,0,0,0.1);
              margin: 20px 0;
            }
            .header {
              background: linear-gradient(135deg, ${templates.get('creative')?.colors.primary}, ${templates.get('creative')?.colors.secondary});
              color: white;
              padding: 25px;
              text-align: center;
            }
            .content {
              padding: 30px;
            }
            .section {
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 1px solid #eee;
            }
            .section-title {
              font-weight: bold;
              color: ${templates.get('creative')?.colors.secondary};
              font-size: 18px;
              margin-bottom: 10px;
            }
            .contact-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
            }
            .contact-item {
              background-color: #f8f8f8;
              border-radius: 8px;
              padding: 12px;
            }
            .contact-label {
              font-size: 12px;
              color: #888;
              margin-bottom: 5px;
            }
            .contact-value {
              font-weight: bold;
              color: ${templates.get('creative')?.colors.secondary};
            }
            .description-box {
              background-color: #f8f8f8;
              border-radius: 8px;
              padding: 15px;
              margin-top: 10px;
              border-left: 4px solid ${templates.get('creative')?.colors.accent};
            }
            .footer {
              text-align: center;
              padding: 20px;
              font-size: 12px;
              color: #888;
              background-color: #f8f8f8;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1>✨ Creative Project Submission</h1>
            </div>
            <div class="content">
              <div class="section">
                <div class="section-title">Contact Information</div>
                <div class="contact-grid">
                  <div class="contact-item">
                    <div class="contact-label">Name</div>
                    <div class="contact-value">${data.name}</div>
                  </div>
                  <div class="contact-item">
                    <div class="contact-label">Phone</div>
                    <div class="contact-value">${data.phone}</div>
                  </div>
                </div>
                <div class="contact-item" style="margin-top: 15px;">
                  <div class="contact-label">Email</div>
                  <div class="contact-value">${data.email}</div>
                </div>
              </div>
              <div class="section">
                <div class="section-title">Project Details</div>
                <div class="description-box">
                  ${data.projectDescription}
                </div>
              </div>
            </div>
            <div class="footer">
              <p>This project submission was received on ${new Date().toLocaleDateString()}.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
    return templates
  }
}