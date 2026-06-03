<?php

namespace App\Exceptions;

use RuntimeException;

class LeadGenerationNotConfiguredException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct(
            'No lead generation provider configured. Please add your API key in Settings.'
        );
    }
}
