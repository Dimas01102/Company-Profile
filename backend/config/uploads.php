<?php

return [

    // Kilobytes, matches Laravel's validator 'max' rule for files (KB).
    'image_kb' => (int) env('MAX_UPLOAD_IMAGE_KB', 5120),
    'document_kb' => (int) env('MAX_UPLOAD_DOCUMENT_KB', 15360),

    'image_mimes' => ['jpg', 'jpeg', 'png', 'webp'],
    'document_mimes' => ['pdf'],

];
