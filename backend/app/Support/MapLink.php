<?php

namespace App\Support;

/**
 * Helpers for turning a pasted Google Maps link into coordinates.
 */
class MapLink
{
    /** Hosts the server is allowed to contact when following a short link. */
    public static function isAllowedHost(?string $host): bool
    {
        if (! $host) {
            return false;
        }

        $host = strtolower($host);

        return $host === 'goo.gl'
            || $host === 'maps.app.goo.gl'
            || (bool) preg_match('/(^|\.)google\.[a-z.]{2,6}$/', $host);
    }

    /**
     * Find "latitude,longitude" inside a Google Maps URL or page body.
     *
     * @return array{latitude: string, longitude: string}|null
     */
    public static function extract(string $text): ?array
    {
        $text = rawurldecode($text);
        $num = '(-?\d{1,3}\.\d+)';

        $patterns = [
            // .../@1.0451,104.0305,17z
            ['/@'.$num.','.$num.'/', 1, 2],
            // ...!3d1.0451!4d104.0305 (place data)
            ['/!3d'.$num.'!4d'.$num.'/', 1, 2],
            // embed links: !2d<lng>!3d<lat>
            ['/!2d'.$num.'!3d'.$num.'/', 2, 1],
            // ?q=1.0451,104.0305  ll=  query=  center=
            ['/[?&](?:q|ll|query|center|destination)='.$num.'\s*,\s*'.$num.'/', 1, 2],
        ];

        foreach ($patterns as [$regex, $latIndex, $lngIndex]) {
            if (preg_match($regex, $text, $m)) {
                $lat = (float) $m[$latIndex];
                $lng = (float) $m[$lngIndex];

                if (abs($lat) <= 90 && abs($lng) <= 180) {
                    return [
                        'latitude' => self::trimNumber($lat),
                        'longitude' => self::trimNumber($lng),
                    ];
                }
            }
        }

        return null;
    }

    public static function embedUrl(string $latitude, string $longitude): string
    {
        return 'https://www.google.com/maps?q='.$latitude.','.$longitude.'&z=15&output=embed';
    }

    private static function trimNumber(float $value): string
    {
        return rtrim(rtrim(number_format($value, 7, '.', ''), '0'), '.');
    }
}
