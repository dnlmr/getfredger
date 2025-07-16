# Laravel Project Copilot Instructions

## Project Overview
This is a Laravel 12 application with a modern frontend stack. The project uses Inertia.js with React 19, TypeScript, TailwindCSS 4, and shadcn/ui components.

## Tech Stack
- **Backend**: Laravel 12 (PHP)
- **Frontend**: React 19 with TypeScript
- **Styling**: TailwindCSS 4
- **UI Components**: shadcn/ui (latest)
- **Bridge**: Inertia.js (full documentation: https://inertiajs.com/llms-full.txt)
- **Database**: MySQL (development)
- **Testing**: Pest PHP
- **Admin Panel**: Filament v4 (beta)

## Development Environment
- `npm run dev` is always running - no need to start it
- Hot reloading is active for frontend changes
- Laravel serves on standard port (typically 8000)

## Laravel Conventions & Rules

### Models
- **NEVER use `$fillable` properties** - we use `Model::unguard()` globally
- **NEVER use mass assignment** - always set properties individually
- All models should use **CarbonImmutable** for dates (configured globally)
- Example model structure:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Example extends Model
{
    // No $fillable - we use Model::unguard()

    protected $casts = [
        'created_at' => 'immutable_datetime',
        'updated_at' => 'immutable_datetime',
    ];
}
```

### Controllers
- Keep controllers thin - business logic should be in services or models
- Use proper HTTP status codes
- Return Inertia responses for page rendering (e.g. always use <Link> instead of <a> tags)
- Example controller method:
```php
public function store(Request $request)
{
    $model = new Model();
    $model->name = $request->name;
    $model->email = $request->email;
    $model->save();

    return redirect()->route('model.index');
}
```

### Database
- Use descriptive migration names
- Always add foreign key constraints
- Use appropriate column types
- Add indexes for frequently queried columns

## Filament Conventions
- We are using **Filament v4 (beta)**. Breaking changes may occur.
- Follow the official documentation for best practices.
- Resources should be kept clean. Business logic should be in services or models.
- Use Filament's form components and validation rules.
- Leverage reactive fields for dynamic forms.

### Example Filament Resource
```php
namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->required(),
                Forms\Components\TextInput::make('email')
                    ->email()
                    ->required(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name'),
                Tables\Columns\TextColumn::make('email'),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
```

## Frontend Conventions

### React Components
- Use TypeScript for all components
- Follow React 19 best practices
- Use functional components with hooks
- Prefer composition over inheritance

### Inertia.js
- Use Inertia forms for form handling
- Leverage Inertia's built-in validation error handling
- Use proper TypeScript interfaces for props
- Example page component:
```typescript
import { Head } from '@inertiajs/react'

interface Props {
    title: string;
    data: any[];
}

export default function ExamplePage({ title, data }: Props) {
    return (
        <>
            <Head title={title} />
            <div className="container mx-auto">
                {/* Component content */}
            </div>
        </>
    )
}
```

### Styling with TailwindCSS 4
- Use utility-first approach
- Leverage TailwindCSS 4's new features
- Prefer Tailwind classes over custom CSS
- Use responsive design patterns

### shadcn/ui Components
- Import components from `@/components/ui`
- If a component is not available, promt the user to create it
- Customize components in the `components/ui` directory
- Follow shadcn/ui naming conventions
- Use proper TypeScript interfaces for component props

## File Structure Conventions

### Backend Structure
```
app/
├── Http/
│   ├── Controllers/     # Thin controllers
│   ├── Middleware/      # Custom middleware
│   └── Requests/        # Form request validation
└── Models/              # Eloquent models (no $fillable)
```

### Frontend Structure
```
resources/kkk
├── js/
│   ├── Components/      # Reusable React components
│   ├── Pages/           # Inertia page components
│   ├── Layouts/         # Layout components
│   └── types/           # TypeScript type definitions
└── css/                 # TailwindCSS styles
```

## Testing Guidelines
- Write feature tests for controllers
- Write unit tests for services and models
- Use Pest PHP syntax
- Test both happy path and edge cases

## Code Quality
- Follow PSR-12 coding standards for PHP
- Use ESLint and Prettier for TypeScript/React
- Write meaningful commit messages
- Add comments for complex business logic

## Security Considerations
- Always validate user input
- Use CSRF protection (automatic with Inertia)
- Sanitize data before database operations
- Follow Laravel security best practices

## Performance Guidelines
- Use eager loading to prevent N+1 queries
- Optimize database queries
- Use appropriate caching strategies
- Minimize bundle size with proper imports

## Common Patterns

### Form Handling with Inertia
```typescript
import { useForm } from '@inertiajs/react'

const { data, setData, post, processing, errors } = useForm({
    name: '',
    email: ''
})

const submit = (e: FormEvent) => {
    e.preventDefault()
    post('/submit')
}
```

### API Resource Usage
- Use API resources for consistent JSON responses
- Transform data appropriately for frontend consumption
- Include necessary relationships in resources

Remember: This project prioritizes modern development practices, type safety, and clean architecture. Always consider the user experience and maintainability when making code decisions.
