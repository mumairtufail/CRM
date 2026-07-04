<?php

it('renders the public tools hub page', function () {
    $response = $this->get(route('tools.index'));
    $response->assertStatus(200);
});

it('renders the email signature generator page', function () {
    $response = $this->get(route('tools.email-signature'));
    $response->assertStatus(200);
});

it('renders the invoice generator page', function () {
    $response = $this->get(route('tools.invoice'));
    $response->assertStatus(200);
});

it('renders the proposal writer page', function () {
    $response = $this->get(route('tools.proposal-writer'));
    $response->assertStatus(200);
});

it('renders the utm builder page', function () {
    $response = $this->get(route('tools.utm-builder'));
    $response->assertStatus(200);
});
