<?php

return [

    // Where new-inquiry notifications are forwarded (Phase 6, Inquiry Management).
    'sales_notifications' => [
        'email' => env('SALES_NOTIFICATION_EMAIL'),
        'whatsapp' => env('SALES_NOTIFICATION_WHATSAPP'),
    ],

];
