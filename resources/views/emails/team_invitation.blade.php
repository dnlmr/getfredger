<x-mail::message>
# You have been invited to join {{ $teamInvite->team->name }}!

<x-mail::button :url="$url">
Accept Invitation
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
