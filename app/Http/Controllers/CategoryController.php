<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = $request->user()->categories()
            ->withCount(['transactions', 'budgets'])
            ->latest()
            ->get();

        return Inertia::render('categories/index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:income,expense',
        ]);

        $request->user()->categories()->create($validated);

        return redirect()->route('categories.index')->with('success', 'Kategori berhasil dibuat.');
    }

    public function update(Request $request, Category $category)
    {
        $this->authorizeCategory($category);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:income,expense',
        ]);

        if ($category->type !== $validated['type']
            && ($category->transactions()->exists() || $category->budgets()->exists())) {
            return back()->withErrors([
                'type' => 'Jenis kategori tidak dapat diubah karena sudah digunakan.',
            ]);
        }

        $category->update($validated);
        
        return redirect()->route('categories.index')->with('success', 'Kategori berhasil diperbarui.');
    }

    public function destroy(Category $category)
    {
        $this->authorizeCategory($category);

        if ($category->transactions()->exists() || $category->budgets()->exists()) {
            return back()->withErrors([
                'category' => 'Kategori yang sudah digunakan tidak dapat dihapus.',
            ]);
        }

        $category->delete();

        return redirect()->route('categories.index')->with('success', 'Kategori berhasil dihapus.');
    }

    private function authorizeCategory(Category $category)
    {
        if ($category->user_id !== auth()->id()) {
            abort(403);
        }
    }
}
