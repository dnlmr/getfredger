<x-mail::message>
# You have been invited to join {{ $teamInvite->team->name }}!

You have been invited to collaborate with the team "{{ $teamInvite->team->name }}". By accepting this invitation, you will gain access to the team.

{{ config('app.name') }} helps teams manage and share invoices efficiently. As a member of this team, you'll be able to:

- Upload and view invoice images
- Organize invoices by categories or projects
- Share financial documents with team members
- Track and manage payment records together

<x-mail::button :url="$url">
Accept Invitation
</x-mail::button>

This invitation will expire in 3 days. If you did not expect to receive this invitation, you can safely ignore this email.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
