# Development Guide - Working with Claude

## Why Each Tool Helps Our Collaboration

### 🎯 TypeScript
**Why it helps Claude help you:**
- I can catch type errors before you even run the code
- Autocomplete suggestions are more accurate
- I can refactor code safely knowing the types

**Your benefit:** Fewer runtime errors, better code suggestions

### 🔍 ESLint + Prettier
**Why it helps Claude help you:**
- Consistent code style makes it easier for me to read and modify
- I can focus on logic instead of formatting
- Catches common mistakes automatically

**Your benefit:** Clean, professional code without thinking about it

### 🚦 Git Hooks (Husky + Lint-staged)
**Why it helps Claude help you:**
- Prevents broken code from being committed
- I know the committed code always passes checks
- Gives us confidence when making changes

**Your benefit:** Your git history stays clean and working

### 🧪 Testing Setup (Vitest + Playwright)
**Why it helps Claude help you:**
- I can write tests for new features
- I can verify my changes don't break existing code
- E2E tests ensure the whole app works together

**Your benefit:** Confidence that new code doesn't break old code

### 🐳 Docker
**Why it helps Claude help you:**
- Consistent environment between your machine and mine
- Easy to spin up local Supabase for testing
- No "works on my machine" problems

**Your benefit:** Everything just works, regardless of your OS

### 📝 Commit Standards
**Why it helps Claude help you:**
- Clear commit history I can read
- Easy to generate changelogs
- Professional git history for portfolios

**Your benefit:** Your git history tells a clear story

## 🚀 Quick Command Reference

### Daily Development Flow
```bash
# 1. Start your dev server
npm run dev

# 2. Make changes (I'll help with this!)

# 3. Before committing (automatic with git hooks)
npm run validate  # Runs typecheck, lint, and tests

# 4. Commit your changes
git add .
git commit -m "feat: your feature description"
```

### When You Need To...

**Fix formatting issues:**
```bash
npm run format
```

**Check for TypeScript errors:**
```bash
npm run typecheck
```

**Run tests:**
```bash
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
```

**Analyze bundle size:**
```bash
npm run analyze
```

**Clean everything and start fresh:**
```bash
npm run clean
npm install
```

## 💡 Pro Tips Working with Claude

1. **Let the tools catch simple errors** - I can focus on architecture and features
2. **Commit often** - The git hooks ensure quality, so don't be afraid
3. **Use TypeScript** - Even if you don't know it well, I do, and it helps me help you
4. **Run tests** - I can write them, you just run them
5. **Trust the process** - These tools catch 90% of common issues automatically

## 🎓 Learning Path

Don't feel you need to understand everything at once:

1. **Week 1-2**: Just use `npm run dev` and let me handle the rest
2. **Week 3-4**: Start understanding TypeScript errors
3. **Month 2**: Learn about the testing I'm writing
4. **Month 3**: Understand the build optimization

## ❓ Common Questions

**Q: This seems like a lot of tools!**
A: Yes, but they work automatically. You mostly just run `npm run dev`.

**Q: What if I break something?**
A: The tools prevent most breaks. If something does break, I'll help fix it.

**Q: Do I need to understand all the config files?**
A: No! They're mostly for me to use when helping you.

**Q: Is this overkill for a solo project?**
A: Not when you have an AI assistant. These tools multiply my effectiveness.

## 🤝 Remember

You're not really coding solo - you have me as your pair programmer. These tools are our shared workspace, optimized for our collaboration. They catch the boring stuff so we can focus on building cool features!

---

*"The best code is the code you don't have to debug." - These tools help us achieve that.*