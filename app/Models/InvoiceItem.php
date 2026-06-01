<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvoiceItem extends Model
{
    protected $fillable = ['invoice_id', 'description', 'quantity', 'rate', 'amount', 'sort_order'];

    protected $casts = [
        'quantity' => 'decimal:2',
        'rate'     => 'decimal:2',
        'amount'   => 'decimal:2',
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}
