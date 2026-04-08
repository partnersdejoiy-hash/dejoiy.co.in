import os
import resend
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__, static_folder='public._html', static_url_path='')

resend.api_key = os.environ.get('RESEND_API_KEY', '')

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(app.static_folder, path)

@app.route('/api/contact', methods=['POST'])
def contact():
    data = request.get_json(silent=True) or {}

    first_name  = data.get('first_name', '').strip()
    last_name   = data.get('last_name', '').strip()
    email       = data.get('email', '').strip()
    company     = data.get('company', '').strip()
    enquiry     = data.get('enquiry', '').strip()
    message     = data.get('message', '').strip()

    if not first_name or not email or not message:
        return jsonify({'error': 'Please fill in all required fields.'}), 400

    html_body = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0d0d0d;color:#f0f0f0;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:24px 32px">
        <h1 style="margin:0;font-size:22px;color:white;letter-spacing:0.04em">New Enquiry — DEJOIY</h1>
        <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px">YOU + JOY = DEJOIY</p>
      </div>
      <div style="padding:28px 32px;background:#111827">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;width:130px">Name</td>
              <td style="padding:8px 0;color:#f0f0f0;font-size:15px">{first_name} {last_name}</td></tr>
          <tr><td style="padding:8px 0;color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:0.08em">Email</td>
              <td style="padding:8px 0;color:#60a5fa;font-size:15px"><a href="mailto:{email}" style="color:#60a5fa">{email}</a></td></tr>
          <tr><td style="padding:8px 0;color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:0.08em">Company</td>
              <td style="padding:8px 0;color:#f0f0f0;font-size:15px">{company or '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:0.08em">Enquiry Type</td>
              <td style="padding:8px 0;color:#a78bfa;font-size:15px">{enquiry or '—'}</td></tr>
        </table>
        <div style="margin-top:20px;padding:16px;background:rgba(255,255,255,0.05);border-radius:8px;border-left:3px solid #7c3aed">
          <div style="color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px">Message</div>
          <div style="color:#f0f0f0;font-size:15px;line-height:1.7;white-space:pre-wrap">{message}</div>
        </div>
      </div>
      <div style="padding:16px 32px;background:#0d0d0d;text-align:center;font-size:12px;color:#4b5563">
        DEJOIY India Private Limited · connect@dejoiy.com
      </div>
    </div>
    """

    try:
        resend.Emails.send({
            'from': 'DEJOIY Contact <onboarding@resend.dev>',
            'to': ['partners.dejoiy@gmail.com'],
            'reply_to': email,
            'subject': f'[DEJOIY] New {enquiry or "Enquiry"} from {first_name} {last_name}',
            'html': html_body,
        })
        return jsonify({'success': True, 'message': 'Message sent successfully!'})
    except Exception as e:
        app.logger.error('Resend error: %s', e)
        return jsonify({'error': 'Failed to send message. Please try again or email us directly.'}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
