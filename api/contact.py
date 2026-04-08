import json
import os
from http.server import BaseHTTPRequestHandler

import resend


class handler(BaseHTTPRequestHandler):

    def do_POST(self):
        try:
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length)
            data = json.loads(body) if body else {}
        except Exception:
            data = {}

        first_name = data.get('first_name', '').strip()
        last_name  = data.get('last_name', '').strip()
        email      = data.get('email', '').strip()
        company    = data.get('company', '').strip()
        enquiry    = data.get('enquiry', '').strip()
        message    = data.get('message', '').strip()

        if not first_name or not email or not message:
            self._respond(400, {'error': 'Please fill in all required fields.'})
            return

        resend.api_key = os.environ.get('RESEND_API_KEY', '')

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
              <tr><td style="padding:8px 0;color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:0.08em">Enquiry</td>
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
            self._respond(200, {'success': True, 'message': 'Message sent successfully!'})
        except Exception as e:
            self._respond(500, {'error': 'Failed to send message. Please try again or email us directly.'})

    def _respond(self, status, payload):
        body = json.dumps(payload).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
