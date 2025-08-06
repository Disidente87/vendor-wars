import fs from 'fs'
import path from 'path'

async function createLocalStorageChecker() {
  console.log('🔍 Creating Simple LocalStorage Checker')
  console.log('=====================================')

  try {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>LocalStorage Checker</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .user { margin: 10px 0; padding: 10px; border: 1px solid #ccc; border-radius: 5px; }
        .success { background-color: #d4edda; border-color: #c3e6cb; }
        .error { background-color: #f8d7da; border-color: #f5c6cb; }
        button { margin: 5px; padding: 10px 15px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer; }
        button:hover { background: #0056b3; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 3px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>🔍 LocalStorage Authentication Checker</h1>
    
    <div>
        <button onclick="checkLocalStorage()">Check LocalStorage</button>
        <button onclick="clearLocalStorage()">Clear LocalStorage</button>
        <button onclick="testAuth()">Test Authentication</button>
    </div>
    
    <div id="results"></div>
    
    <script>
        function checkLocalStorage() {
            const results = document.getElementById('results');
            results.innerHTML = '<h2>LocalStorage Check Results:</h2>';
            
            const storedUser = localStorage.getItem('farcaster-auth-user');
            
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    const div = document.createElement('div');
                    div.className = 'user success';
                    div.innerHTML = \`
                        <h3>✅ User Found in LocalStorage</h3>
                        <p><strong>FID:</strong> \${parsedUser.fid}</p>
                        <p><strong>Username:</strong> \${parsedUser.username}</p>
                        <p><strong>Display Name:</strong> \${parsedUser.displayName}</p>
                        <p><strong>Battle Tokens:</strong> \${parsedUser.battleTokens}</p>
                        <p><strong>Vote Streak:</strong> \${parsedUser.voteStreak}</p>
                        <pre>\${JSON.stringify(parsedUser, null, 2)}</pre>
                    \`;
                    results.appendChild(div);
                } catch (error) {
                    const div = document.createElement('div');
                    div.className = 'user error';
                    div.innerHTML = \`
                        <h3>❌ Error Parsing LocalStorage</h3>
                        <p>Error: \${error.message}</p>
                        <p>Raw data: \${storedUser}</p>
                    \`;
                    results.appendChild(div);
                }
            } else {
                const div = document.createElement('div');
                div.className = 'user error';
                div.innerHTML = \`
                    <h3>❌ No User in LocalStorage</h3>
                    <p>No 'farcaster-auth-user' found in localStorage</p>
                \`;
                results.appendChild(div);
            }
            
            // Show all localStorage keys
            const allKeys = document.createElement('div');
            allKeys.className = 'user';
            allKeys.innerHTML = \`
                <h3>All LocalStorage Keys:</h3>
                <ul>\${Object.keys(localStorage).map(key => \`<li>\${key}</li>\`).join('')}</ul>
            \`;
            results.appendChild(allKeys);
        }
        
        function clearLocalStorage() {
            localStorage.removeItem('farcaster-auth-user');
            alert('LocalStorage cleared!');
            checkLocalStorage();
        }
        
        async function testAuth() {
            const results = document.getElementById('results');
            results.innerHTML = '<h2>Authentication Test Results:</h2>';
            
            const testUsers = [
                { fid: 497866, username: 'criptodisidente' },
                { fid: 465823, username: 'farcaster_user' },
                { fid: 789012, username: 'juan_vendor' }
            ];
            
            for (const user of testUsers) {
                try {
                    const response = await fetch(\`http://localhost:3000/api/auth/farcaster?fid=\${user.fid}\`);
                    const result = await response.json();
                    
                    const div = document.createElement('div');
                    div.className = result.success ? 'user success' : 'user error';
                    div.innerHTML = \`
                        <h3>\${result.success ? '✅' : '❌'} User \${user.fid} (\${user.username})</h3>
                        <p><strong>Success:</strong> \${result.success}</p>
                        \${result.success ? \`
                            <p><strong>Username:</strong> \${result.data.username}</p>
                            <p><strong>Display Name:</strong> \${result.data.display_name}</p>
                            <p><strong>Battle Tokens:</strong> \${result.data.battle_tokens}</p>
                            <p><strong>Vote Streak:</strong> \${result.data.vote_streak}</p>
                        \` : \`
                            <p><strong>Error:</strong> \${result.error}</p>
                        \`}
                    \`;
                    results.appendChild(div);
                } catch (error) {
                    const div = document.createElement('div');
                    div.className = 'user error';
                    div.innerHTML = \`
                        <h3>❌ Error Testing User \${user.fid}</h3>
                        <p>Error: \${error.message}</p>
                    \`;
                    results.appendChild(div);
                }
            }
        }
        
        // Auto-check on load
        checkLocalStorage();
    </script>
</body>
</html>`;

    const filePath = path.join(process.cwd(), 'localstorage-checker.html');
    fs.writeFileSync(filePath, htmlContent);
    
    console.log('✅ Created localStorage-checker.html');
    console.log('📁 File location:', filePath);
    
    console.log('\n🎉 LocalStorage checker created!')
    console.log('\n📋 Instructions:')
    console.log('   1. Open localStorage-checker.html in your browser')
    console.log('   2. Click "Check LocalStorage" to see current state')
    console.log('   3. Click "Test Authentication" to test all users')
    console.log('   4. Click "Clear LocalStorage" to reset if needed')
    console.log('\n💡 This will help identify if the issue is with:')
    console.log('   - localStorage not being saved')
    console.log('   - localStorage being cleared')
    console.log('   - Authentication endpoint issues')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

createLocalStorageChecker() 