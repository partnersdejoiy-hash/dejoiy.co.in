import os
import resend
from flask import Flask, request, jsonify, send_from_directory, redirect

app = Flask(__name__, static_folder='public', static_url_path='')

resend.api_key = os.environ.get('RESEND_API_KEY', '')

PAGES = {
    '':         'index.html',
    'about':    'about.html',
    'services': 'services.html',
    'team':     'team.html',
    'contact':  'contact.html',
}

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.after_request
def add_cache_headers(response):
    path = request.path
    if path.startswith('/assets/'):
        if path.endswith(('.css', '.js')):
            response.cache_control.max_age = 604800
            response.cache_control.public = True
        elif path.endswith(('.jpg', '.jpeg', '.png', '.svg', '.webp', '.gif')):
            response.cache_control.max_age = 2592000
            response.cache_control.public = True
    return response

@app.route('/<page>')
def page(page):
    if page in PAGES:
        return send_from_directory(app.static_folder, PAGES[page])
    if page.endswith('.html'):
        slug = page[:-5]
        if slug == 'index':
            return redirect('/', 301)
        if slug in PAGES:
            return redirect(f'/{slug}', 301)
    return send_from_directory(app.static_folder, page)

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
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">
          <img src="https://dejoiy.co.in/assets/images/logo/dejoiy-logo.png" alt="DEJOIY" width="44" height="44" style="border-radius:10px;display:block" />
          <div>
            <div style="font-size:20px;font-weight:800;color:white;letter-spacing:0.04em;line-height:1.1">DEJOIY</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.65);letter-spacing:0.1em;text-transform:uppercase">You + Joy</div>
          </div>
        </div>
        <h1 style="margin:0;font-size:20px;color:white;letter-spacing:0.02em">New Enquiry</h1>
        <p style="margin:5px 0 0;color:rgba(255,255,255,0.7);font-size:12px">YOU + JOY = DEJOIY</p>
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
        DEJOIY · connect@dejoiy.com
      </div>
    </div>
    """

    try:
        resend.Emails.send({
            'from': 'DEJOIY <noreply.notifications@dejoiy.com>',
            'to': ['partners.dejoiy@gmail.com'],
            'reply_to': 'connect@dejoiy.com',
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
