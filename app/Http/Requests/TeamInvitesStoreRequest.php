<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TeamInvitesStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $team = $this->user()->currentTeam;

        // Return false if this is a personal team
        if ($team->personal_team) {
            return false;
        }

        return $this->user()->can('inviteToTeam', $team);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $teamId = $this->user()->currentTeam->id;

        // Get emails of users already on this team
        $existingTeamEmails = User::whereHas('teams', function ($query) use ($teamId) {
            $query->where('teams.id', $teamId);
        })->pluck('email')->toArray();

        return [
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique('team_invites')->where('team_id', $teamId),
                Rule::notIn($existingTeamEmails),
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.unique' => 'An invitation has already been sent to this email.',
            'email.not_in' => 'The user with this email is already a member of the team.',
        ];
    }
}
