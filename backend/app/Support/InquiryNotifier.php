<?php

namespace App\Support;

use App\Models\CompanyProfile;
use App\Models\Inquiry;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Emails the company when a visitor sends an inquiry. Delivery uses the SMTP
 * settings in .env (MAIL_*). A mail failure is logged and never stops the
 * visitor's form from being saved: the inquiry is always stored in the admin
 * Inquiries list first.
 */
class InquiryNotifier
{
    public static function notify(Inquiry $inquiry): void
    {
        $to = config('inquiry.notify_email') ?: CompanyProfile::query()->value('email');

        if (! $to || ! filter_var($to, FILTER_VALIDATE_EMAIL)) {
            return;
        }

        $inquiry->loadMissing('product');
        $e = fn (?string $v) => htmlspecialchars((string) $v, ENT_QUOTES, 'UTF-8');

        $rows = [
            'Name' => $inquiry->name,
            'Company' => $inquiry->company,
            'Email' => $inquiry->email,
            'Phone' => $inquiry->phone,
            'Source' => $inquiry->source,
            'Product' => $inquiry->product?->name,
            'Subject' => $inquiry->subject,
        ];

        $table = '';
        foreach ($rows as $label => $value) {
            if ($value) {
                $table .= '<tr><td style="padding:4px 12px 4px 0;color:#666">'.$e($label).'</td><td style="padding:4px 0"><strong>'.$e($value).'</strong></td></tr>';
            }
        }

        $html = '<div style="font-family:Arial,sans-serif;font-size:14px;color:#222">'
            .'<h2 style="margin:0 0 12px">New website inquiry #'.$inquiry->id.'</h2>'
            .'<table>'.$table.'</table>'
            .'<p style="margin:16px 0 4px;color:#666">Message</p>'
            .'<div style="white-space:pre-wrap;border-left:3px solid #ccc;padding-left:12px">'.$e($inquiry->message).'</div>'
            .'<p style="margin-top:20px;color:#666">Reply to this email to answer the sender directly, '
            .'then update the status in Admin > Inquiries.</p></div>';

        try {
            Mail::html($html, function ($message) use ($to, $inquiry) {
                $message->to($to)
                    ->subject('New inquiry from '.$inquiry->name.($inquiry->subject ? ': '.$inquiry->subject : ''))
                    ->replyTo($inquiry->email, $inquiry->name);
            });
        } catch (Throwable $e) {
            Log::warning('Could not send the inquiry notification email: '.$e->getMessage());
        }
    }
}
