<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\User;

class TeamInvitesStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('inviteToTeam', $this->team);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $teamId = $this->user()->currentTeam->id;

        return [
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique('team_invites')
                    ->where('team_id', $teamId),
                function ($attribute, $value, $fail) use ($teamId) {
                    // Check if the email belongs to a user who is already on the team
                    $user = User::where('email', $value)->first();
                    if ($user && $user->teams()->where('teams.id', $teamId)->exists()) {
                        $fail('The user with this email is already a member of the team.');
                    }
                },
            ],
        ];
    }
}
