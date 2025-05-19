const cpu = {
    registers: {
        ACC: 0,  
        PC: 0,   
        IR: 0,   
        MAR: 0,  
        MBR: 0, 
        FLAGS: 0  
    },
    memory: new Array(256).fill(0),
    isRunning: false,
    speed: 1000,
    timer: null
};


const FLAGS = {
    ZERO: 0x01,     
    NEGATIVE: 0x02,  
    CARRY: 0x04,    
    OVERFLOW: 0x08   
};


const instructions = {
    LOAD: 0x01,   
    STORE: 0x02,  
    ADD: 0x03,    
    SUB: 0x04,    
    JUMP: 0x05,   
    JZERO: 0x06,  
    HALT: 0x07,   
    CMP: 0x08,    
    JLT: 0x09,    
    JGT: 0x0A,    
    JLE: 0x0B,  
    JGE: 0x0C,    
    JEQ: 0x0D,    
    JNE: 0x0E     
};

const instructionAliases = {
    'HLT': 'HALT',
    'JZ': 'JZERO',
    'JMP': 'JUMP',
    'JE': 'JEQ',
    'JNZ': 'JNE'
};


const samplePrograms = {
    'Addition': `; Simple addition program
LOAD 10    ; Load value from address 10
ADD 11     ; Add value from address 11
STORE 12   ; Store result in address 12
HALT       ; Stop execution

; Data section
.org 10    ; Start data at address 10
5          ; First number
7          ; Second number
0          ; Result will be stored here`,
    
    'Countdown': `; Countdown from 5 to 0
LOAD 20    ; Load initial value
STORE 21   ; Store in counter location
loop:
LOAD 21    ; Load counter
STORE 22   ; Display current value
SUB 23     ; Subtract 1
STORE 21   ; Store new counter value
JZERO end  ; If zero, end program
JUMP loop  ; Continue loop
end:
HALT       ; Stop execution

; Data section
.org 20    ; Start data at address 20
5          ; Initial value
0          ; Counter location
0          ; Display location
1          ; Decrement value`,
    
    'Counter': `; Count up from 0 to 5
LOAD 30    ; Load initial counter (0)
loop:
STORE 31   ; Store current value
ADD 32     ; Add 1
CMP 33     ; Compare with limit
JEQ end    ; If equal to limit, end
JUMP loop  ; Continue loop
end:
HALT       ; Stop execution

; Data section
.org 30    ; Start data at address 30
0          ; Initial counter value
0          ; Current value storage
1          ; Increment value
5          ; Limit value`,

    'Fibonacci': `; Calculate first 8 Fibonacci numbers
LOAD 40    ; Load initial value (0)
STORE 41   ; Store F(0)
LOAD 42    ; Load second value (1)
STORE 43   ; Store F(1)
STORE 44   ; Store current position
loop:
LOAD 44    ; Load current position
CMP 45     ; Compare with limit
JEQ end    ; If reached limit, end
LOAD 41    ; Load F(n-2)
ADD 43     ; Add F(n-1)
STORE 46   ; Store F(n)
LOAD 43    ; Load F(n-1)
STORE 41   ; Update F(n-2)
LOAD 46    ; Load F(n)
STORE 43   ; Update F(n-1)
LOAD 44    ; Load position
ADD 47     ; Increment position
STORE 44   ; Update position
JUMP loop  ; Continue loop
end:
HALT       ; Stop execution

; Data section
.org 40    ; Start data at address 40
0          ; Initial value
0          ; F(n-2)
1          ; Second value
1          ; F(n-1)
0          ; Current position
8          ; Limit
1          ; Increment value
0          ; F(n)`,

    'Factorial': `; Calculate factorial of 5
LOAD 50    ; Load initial value (5)
STORE 51   ; Store current number
LOAD 52    ; Load initial result (1)
STORE 53   ; Store result
loop:
LOAD 51    ; Load current number
CMP 54     ; Compare with 1
JEQ end    ; If 1, end
LOAD 53    ; Load result
MUL 51     ; Multiply by current number
STORE 53   ; Store new result
LOAD 51    ; Load current number
SUB 55     ; Subtract 1
STORE 51   ; Update current number
JUMP loop  ; Continue loop
end:
HALT       ; Stop execution

; Data section
.org 50    ; Start data at address 50
5          ; Initial value
5          ; Current number
1          ; Initial result
1          ; Result
1          ; Comparison value
1          ; Decrement value`,

    'Max Value': `; Find maximum value in array
LOAD 60    ; Load array start address
STORE 61   ; Store current address
LOAD 62    ; Load array length
STORE 63   ; Store counter
LOAD 64    ; Load initial max value
STORE 65   ; Store max value
loop:
LOAD 63    ; Load counter
CMP 66     ; Compare with 0
JEQ end    ; If 0, end
LOAD 61    ; Load current address
LOAD 67    ; Load value at address
CMP 65     ; Compare with max
JLE skip   ; If less or equal, skip
LOAD 67    ; Load new max value
STORE 65   ; Update max value
skip:
LOAD 61    ; Load current address
ADD 68     ; Increment address
STORE 61   ; Update address
LOAD 63    ; Load counter
SUB 69     ; Decrement counter
STORE 63   ; Update counter
JUMP loop  ; Continue loop
end:
HALT       ; Stop execution

; Data section
.org 60    ; Start data at address 60
70         ; Array start address
70         ; Current address
5          ; Array length
0          ; Counter
0          ; Initial max
0          ; Max value
0          ; Comparison value
1          ; Address increment
1          ; Counter decrement

; Array data
.org 70    ; Array data starts at address 70
12         ; Array[0]
45         ; Array[1]
7          ; Array[2]
89         ; Array[3]
23         ; Array[4]`,

    'Bubble Sort': `; Sort array using bubble sort
LOAD 80    ; Load array start address
STORE 81   ; Store current address
LOAD 82    ; Load array length
STORE 83   ; Store outer counter
outer:
LOAD 83    ; Load outer counter
CMP 84     ; Compare with 1
JEQ end    ; If 1, end
LOAD 80    ; Load array start
STORE 81   ; Reset current address
LOAD 83    ; Load outer counter
SUB 85     ; Decrement for inner loop
STORE 86   ; Store inner counter
inner:
LOAD 86    ; Load inner counter
CMP 87     ; Compare with 0
JEQ next   ; If 0, next outer iteration
LOAD 81    ; Load current address
LOAD 88    ; Load current value
STORE 89   ; Store current value
LOAD 81    ; Load current address
ADD 90     ; Increment address
LOAD 91    ; Load next value
CMP 89     ; Compare with current
JLE skip   ; If less or equal, skip
; Swap values
LOAD 89    ; Load current value
STORE 92   ; Store temp
LOAD 91    ; Load next value
STORE 93   ; Store in current
LOAD 92    ; Load temp
STORE 94   ; Store in next
skip:
LOAD 81    ; Load current address
ADD 95     ; Increment address
STORE 81   ; Update address
LOAD 86    ; Load inner counter
SUB 96     ; Decrement counter
STORE 86   ; Update counter
JUMP inner ; Continue inner loop
next:
LOAD 83    ; Load outer counter
SUB 97     ; Decrement counter
STORE 83   ; Update counter
JUMP outer ; Continue outer loop
end:
HALT       ; Stop execution

; Data section
.org 80    ; Start data at address 80
100        ; Array start address
100        ; Current address
5          ; Array length
5          ; Outer counter
1          ; Comparison value
1          ; Decrement value
0          ; Inner counter
0          ; Comparison value
0          ; Current value
0          ; Current value
0          ; Next value
0          ; Temp value
0          ; Current value
0          ; Next value
1          ; Address increment
1          ; Counter decrement
1          ; Counter decrement

; Array data
.org 100   ; Array data starts at address 100
12         ; Array[0]
45         ; Array[1]
7          ; Array[2]
89         ; Array[3]
23         ; Array[4]`
};


const elements = {
    assemblyCode: document.getElementById('assemblyCode'),
    memoryView: document.getElementById('memoryView'),
    console: document.getElementById('console'),
    loadSample: document.getElementById('loadSample'),
    assemble: document.getElementById('assemble'),
    run: document.getElementById('run'),
    step: document.getElementById('step'),
    pause: document.getElementById('pause'),
    reset: document.getElementById('reset')
};


function initializeUI() {
    const registerContainer = document.querySelector('.register-grid');
    registerContainer.innerHTML = '';
  
    const registerInfo = {
        'ACC': 'Accumulator - Main arithmetic register',
        'PC': 'Program Counter - Points to next instruction',
        'IR': 'Instruction Register - Holds current instruction',
        'MAR': 'Memory Address Register - Holds memory address',
        'MBR': 'Memory Buffer Register - Holds memory data',
        'FLAGS': 'Status Flags - Indicates operation results'
    };
    
    Object.entries(registerInfo).forEach(([reg, description]) => {
        const regDiv = document.createElement('div');
        regDiv.className = 'register';
        regDiv.dataset.reg = reg;
        regDiv.dataset.tooltip = description;
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'register-name';
        nameDiv.textContent = reg;
        
        const valueDiv = document.createElement('div');
        valueDiv.className = 'register-value';

        if (reg === 'FLAGS') {
            valueDiv.textContent = '0000 0000';
        } else if (reg === 'PC' || reg === 'MAR') {
            valueDiv.textContent = '0x00';
        } else {
            valueDiv.textContent = '00';
        }
        
        regDiv.appendChild(nameDiv);
        regDiv.appendChild(valueDiv);
        registerContainer.appendChild(regDiv);

        regDiv.addEventListener('click', () => {
            const value = cpu.registers[reg];
            if (reg === 'FLAGS') {
                const flags = [];
                if (value & FLAGS.ZERO) flags.push('ZERO');
                if (value & FLAGS.NEGATIVE) flags.push('NEGATIVE');
                if (value & FLAGS.CARRY) flags.push('CARRY');
                if (value & FLAGS.OVERFLOW) flags.push('OVERFLOW');
                log(`${reg}: ${valueDiv.textContent} (${flags.join(', ') || 'No flags set'})`);
            } else if (reg === 'IR') {
                const instrName = Object.entries(instructions)
                    .find(([_, code]) => code === value)?.[0];
                log(`${reg}: ${instrName || 'Unknown'} (0x${value.toString(16).toUpperCase()})`);
            } else {
                log(`${reg}: ${value} (0x${value.toString(16).toUpperCase()})`);
            }
        });
    });
  
    updateMemoryView();

    updateRegisterValues();

    const sampleSelect = document.getElementById('sampleSelect');
    sampleSelect.innerHTML = '<option value="">Select Sample Program</option>';
    Object.keys(samplePrograms).forEach(program => {
        const option = document.createElement('option');
        option.value = program;
        option.textContent = program;
        sampleSelect.appendChild(option);
    });

    elements.loadSample.addEventListener('click', loadSampleProgram);
    elements.assemble.addEventListener('click', assembleProgram);
    elements.run.addEventListener('click', runProgram);
    elements.step.addEventListener('click', stepProgram);
    elements.pause.addEventListener('click', pauseProgram);
    elements.reset.addEventListener('click', resetProgram);
 
    resetProgram();
}

function updateRegisterValues() {
    Object.entries(cpu.registers).forEach(([reg, value]) => {
        const element = document.querySelector(`.register[data-reg="${reg}"] .register-value`);
        if (element) {
            const oldValue = element.textContent;
            let newValue;
     
            switch (reg) {
                case 'FLAGS':

                    const binary = value.toString(2).padStart(8, '0');
                    newValue = `${binary.slice(0, 4)} ${binary.slice(4)}`;
                    break;
                case 'PC':
                case 'MAR':

                    newValue = `0x${value.toString(16).padStart(2, '0').toUpperCase()}`;
                    break;
                case 'IR':
      
                    const instructionName = Object.entries(instructions)
                        .find(([_, code]) => code === value)?.[0];
                    newValue = instructionName 
                        ? `${instructionName} (${value.toString(16).padStart(2, '0').toUpperCase()})`
                        : value.toString(16).padStart(2, '0').toUpperCase();
                    break;
                default:
          
                    newValue = value.toString(16).padStart(2, '0').toUpperCase();
            }
            
            if (oldValue !== newValue) {
            
                element.textContent = newValue;
                element.classList.remove('value-updated');
                void element.offsetWidth; 
                element.classList.add('value-updated');
       
                const regDiv = element.parentElement;
                switch (reg) {
                    case 'FLAGS':
                        const flags = [];
                        if (value & FLAGS.ZERO) flags.push('ZERO');
                        if (value & FLAGS.NEGATIVE) flags.push('NEGATIVE');
                        if (value & FLAGS.CARRY) flags.push('CARRY');
                        if (value & FLAGS.OVERFLOW) flags.push('OVERFLOW');
                        regDiv.dataset.tooltip = `Flags Set: ${flags.join(', ') || 'None'}`;
                        break;
                    case 'IR':
                        const instrName = Object.entries(instructions)
                            .find(([_, code]) => code === value)?.[0];
                        regDiv.dataset.tooltip = instrName 
                            ? `Current Instruction: ${instrName}`
                            : `Value: ${value} (0x${value.toString(16).toUpperCase()})`;
                        break;
                    default:
                        regDiv.dataset.tooltip = `Value: ${value} (0x${value.toString(16).toUpperCase()})`;
                }
            }
        }
    });
}

function updateMemoryView() {
    const memoryView = elements.memoryView;
    const rows = 8;
    const cols = 8;

    const instructionNames = {};
    Object.entries(instructions).forEach(([name, code]) => {
        instructionNames[code] = name;
    });
    
    if (!memoryView.children.length) {
 
        for (let i = 0; i < rows * cols; i++) {
            const cell = document.createElement('div');
            cell.className = 'memory-cell';
            
            const address = document.createElement('div');
            address.className = 'address';
            const hexAddress = i.toString(16).padStart(2, '0').toUpperCase();
            address.textContent = `0x${hexAddress}`;
            
            const value = document.createElement('div');
            value.className = 'value';
            const hexValue = cpu.memory[i].toString(16).padStart(2, '0').toUpperCase();
            value.textContent = hexValue;
            
            const isInstruction = instructionNames[cpu.memory[i]] !== undefined;
            if (isInstruction) {
                cell.dataset.type = 'instruction';
                cell.dataset.tooltip = `Address: 0x${hexAddress}\nInstruction: ${instructionNames[cpu.memory[i]]}\nValue: 0x${hexValue}`;
            } else {
                cell.dataset.type = 'data';
                cell.dataset.tooltip = `Address: 0x${hexAddress}\nData Value: ${cpu.memory[i]} (0x${hexValue})`;
            }
            
            cell.appendChild(address);
            cell.appendChild(value);
            memoryView.appendChild(cell);
            
            cell.addEventListener('click', () => {
                document.querySelectorAll('.memory-cell').forEach(c => c.classList.remove('active'));
                cell.classList.add('active');
                if (isInstruction) {
                    log(`Memory[0x${hexAddress}] = ${instructionNames[cpu.memory[i]]} (0x${hexValue})`);
                } else {
                    log(`Memory[0x${hexAddress}] = ${cpu.memory[i]} (0x${hexValue})`);
                }
            });
        }
    } else {
      
        const cells = memoryView.children;
        for (let i = 0; i < cells.length; i++) {
            const valueElement = cells[i].querySelector('.value');
            const hexValue = cpu.memory[i].toString(16).padStart(2, '0').toUpperCase();
            
            if (valueElement.textContent !== hexValue) {
                valueElement.textContent = hexValue;
                valueElement.classList.remove('value-updated');
                void valueElement.offsetWidth; 
                valueElement.classList.add('value-updated');
   
                const hexAddress = i.toString(16).padStart(2, '0').toUpperCase();
                const isInstruction = instructionNames[cpu.memory[i]] !== undefined;
                
                cells[i].dataset.type = isInstruction ? 'instruction' : 'data';
                if (isInstruction) {
                    cells[i].dataset.tooltip = `Address: 0x${hexAddress}\nInstruction: ${instructionNames[cpu.memory[i]]}\nValue: 0x${hexValue}`;
                } else {
                    cells[i].dataset.tooltip = `Address: 0x${hexAddress}\nData Value: ${cpu.memory[i]} (0x${hexValue})`;
                }
            }
        }
    }
}

function updateButtonStates() {
    elements.run.classList.toggle('active', cpu.isRunning);
    elements.pause.classList.toggle('active', cpu.isRunning);
    elements.step.disabled = cpu.isRunning;
    elements.assemble.disabled = cpu.isRunning;
    elements.reset.disabled = cpu.isRunning;
}

function log(message, type = 'info') {
    const p = document.createElement('p');
    const timestamp = new Date().toLocaleTimeString();
    p.textContent = `[${timestamp}] ${message}`;
    p.className = type;
    elements.console.appendChild(p);
    elements.console.scrollTop = elements.console.scrollHeight;

    p.style.opacity = '0';
    requestAnimationFrame(() => {
        p.style.transition = 'opacity 0.3s ease';
        p.style.opacity = '1';
    });
 
    while (elements.console.children.length > 100) {
        elements.console.removeChild(elements.console.firstChild);
    }
}

document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'TEXTAREA') return;
    
    switch (e.key.toLowerCase()) {
        case 'f5':
        case 'r':
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                runProgram();
            }
            break;
        case 'f8':
        case 's':
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                stepProgram();
            }
            break;
        case 'f6':
        case 'p':
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                pauseProgram();
            }
            break;
        case 'escape':
            pauseProgram();
            break;
    }
});


const programDescriptions = {
    'Addition': 'Demonstrates basic arithmetic by adding two numbers and storing the result.',
    'Countdown': 'Shows loop implementation by counting down from 5 to 0.',
    'Counter': 'Illustrates conditional branching by counting up until reaching 5.',
    'Fibonacci': 'Calculates the first 8 Fibonacci numbers using iteration.',
    'Factorial': 'Computes the factorial of 5 using a loop.',
    'Max Value': 'Finds the maximum value in an array of numbers.',
    'Bubble Sort': 'Sorts an array of numbers using the bubble sort algorithm.'
};

function loadSampleProgram() {
    const select = document.getElementById('sampleSelect');
    const programName = select.value;
    if (!programName) {
        log('Please select a sample program first', 'error');
        return;
    }
    
    elements.assemblyCode.value = samplePrograms[programName].trim();
    log(`Loaded sample program: ${programName}`, 'info');
    log(`Description: ${programDescriptions[programName]}`, 'info');

    resetProgram();
 
    assembleProgram();
}

function assembleProgram() {
    const code = elements.assemblyCode.value.trim();
    if (!code) {
        log('No code to assemble', 'error');
        return false;
    }

    log('Starting assembly process...', 'info');
    
    // Reset memory
    cpu.memory.fill(0);
    
    const lines = code.split('\n');
    let currentAddress = 0;
    let machineCode = [];
    
    // First pass: process .org directives and data
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith(';')) continue;
        
        if (line.toLowerCase().startsWith('.org')) {
            const newAddress = parseInt(line.split(' ')[1]);
            if (isNaN(newAddress) || newAddress < 0 || newAddress > 255) {
                log(`Invalid .org address at line ${i + 1}`, 'error');
                return false;
            }
            currentAddress = newAddress;
            continue;
        }
        
        // If it's a number, treat it as data
        const value = parseInt(line);
        if (!isNaN(value)) {
            if (value < 0 || value > 255) {
                log(`Invalid data value at line ${i + 1}`, 'error');
                return false;
            }
            cpu.memory[currentAddress] = value;
            machineCode.push(value.toString(16).padStart(2, '0').toUpperCase());
            currentAddress++;
            continue;
        }
        
        // Skip if it's just a comment or label
        if (line.endsWith(':') || line.startsWith(';')) continue;
        
        // Process instruction
        const parts = line.split(';')[0].trim().split(' ');
        const instruction = parts[0].toUpperCase();
        const operand = parts[1];
        
        if (!instructions[instruction]) {
            log(`Unknown instruction: ${instruction} at line ${i + 1}`, 'error');
            return false;
        }
        
        const opcode = instructions[instruction];
        cpu.memory[currentAddress] = opcode;
        machineCode.push(opcode.toString(16).padStart(2, '0').toUpperCase());
        
        if (operand !== undefined && instruction !== 'HALT') {
            const address = parseInt(operand);
            if (isNaN(address) || address < 0 || address > 255) {
                log(`Invalid address at line ${i + 1}`, 'error');
                return false;
            }
            cpu.memory[currentAddress + 1] = address;
            machineCode.push(address.toString(16).padStart(2, '0').toUpperCase());
            currentAddress += 2;
        } else {
            currentAddress++;
        }
    }
    
    // Output the machine code in the requested format
    addOutputLine(`Machine Code: ${machineCode.join(' ')}`, 'info');
    log('Assembly completed successfully', 'success');
    updateMemoryView();
    return true;
}

function executeStep() {
    cpu.registers.MAR = cpu.registers.PC;
    cpu.registers.MBR = cpu.memory[cpu.registers.MAR];
    cpu.registers.IR = cpu.registers.MBR;
    cpu.registers.PC++;

    highlightMemoryCell(cpu.registers.MAR);

    switch (cpu.registers.IR) {
        case instructions.LOAD:
            cpu.registers.MAR = cpu.memory[cpu.registers.PC++];
            cpu.registers.MBR = cpu.memory[cpu.registers.MAR];
            cpu.registers.ACC = cpu.registers.MBR;
            updateFlags(cpu.registers.ACC);
            log(`LOAD: Loaded ${cpu.registers.ACC} from address ${cpu.registers.MAR}`);
            addOutputLine(`Loaded value: ${cpu.registers.ACC}`, 'info');
            break;
            
        case instructions.STORE:
            cpu.registers.MAR = cpu.memory[cpu.registers.PC++];
            cpu.registers.MBR = cpu.registers.ACC;
            cpu.memory[cpu.registers.MAR] = cpu.registers.MBR;
            log(`STORE: Stored ${cpu.registers.ACC} to address ${cpu.registers.MAR}`);
            addOutputLine(`Stored value: ${cpu.registers.ACC} at address 0x${cpu.registers.MAR.toString(16).toUpperCase()}`, 'success');
            break;
            
        case instructions.ADD:
            cpu.registers.MAR = cpu.memory[cpu.registers.PC++];
            cpu.registers.MBR = cpu.memory[cpu.registers.MAR];
            const sum = cpu.registers.ACC + cpu.registers.MBR;
            cpu.registers.FLAGS = 0;
            if (sum > 255) cpu.registers.FLAGS |= FLAGS.CARRY;
            if ((cpu.registers.ACC ^ sum) & (cpu.registers.MBR ^ sum) & 0x80) cpu.registers.FLAGS |= FLAGS.OVERFLOW;
            cpu.registers.ACC = sum & 0xFF;
            updateFlags(cpu.registers.ACC);
            log(`ADD: Added ${cpu.registers.MBR} to ACC (new value: ${cpu.registers.ACC})`);
            addOutputLine(`Addition result: ${cpu.registers.ACC}`, 'success');
            break;
            
        case instructions.SUB:
            cpu.registers.MAR = cpu.memory[cpu.registers.PC++];
            cpu.registers.MBR = cpu.memory[cpu.registers.MAR];
            const diff = cpu.registers.ACC - cpu.registers.MBR;
            cpu.registers.FLAGS = 0;
            if (diff < 0) cpu.registers.FLAGS |= FLAGS.CARRY;
            if ((cpu.registers.ACC ^ cpu.registers.MBR) & (cpu.registers.ACC ^ diff) & 0x80) cpu.registers.FLAGS |= FLAGS.OVERFLOW;
            cpu.registers.ACC = diff & 0xFF;
            updateFlags(cpu.registers.ACC);
            log(`SUB: Subtracted ${cpu.registers.MBR} from ACC (new value: ${cpu.registers.ACC})`);
            addOutputLine(`Subtraction result: ${cpu.registers.ACC}`, 'success');
            break;

        case instructions.CMP:
            cpu.registers.MAR = cpu.memory[cpu.registers.PC++];
            cpu.registers.MBR = cpu.memory[cpu.registers.MAR];
            const result = cpu.registers.ACC - cpu.registers.MBR;
            cpu.registers.FLAGS = 0;
            if (result === 0) cpu.registers.FLAGS |= FLAGS.ZERO;
            if (result < 0) cpu.registers.FLAGS |= FLAGS.NEGATIVE;
            if (result < -128 || result > 127) cpu.registers.FLAGS |= FLAGS.OVERFLOW;
            log(`CMP: Compared ${cpu.registers.ACC} with ${cpu.registers.MBR}`);
            const compResult = result === 0 ? "Equal" : (result < 0 ? "Less than" : "Greater than");
            addOutputLine(`Comparison: ${cpu.registers.ACC} is ${compResult} ${cpu.registers.MBR}`, 'info');
            break;
            
        case instructions.JUMP:
            cpu.registers.PC = cpu.memory[cpu.registers.PC];
            log(`JUMP: Jumped to address ${cpu.registers.PC}`);
            break;
            
        case instructions.JZERO:
            if (cpu.registers.ACC === 0) {
                cpu.registers.PC = cpu.memory[cpu.registers.PC];
                log(`JZERO: Jumped to address ${cpu.registers.PC} (ACC is zero)`);
            } else {
                cpu.registers.PC++;
                log(`JZERO: Skipped jump (ACC is not zero)`);
            }
            break;

        case instructions.JLT:
            if (cpu.registers.FLAGS & FLAGS.NEGATIVE) {
                cpu.registers.PC = cpu.memory[cpu.registers.PC];
                log(`JLT: Jumped to address ${cpu.registers.PC} (result was negative)`);
            } else {
                cpu.registers.PC++;
                log(`JLT: Skipped jump (result was not negative)`);
            }
            break;

        case instructions.JGT:
            if (!(cpu.registers.FLAGS & (FLAGS.NEGATIVE | FLAGS.ZERO))) {
                cpu.registers.PC = cpu.memory[cpu.registers.PC];
                log(`JGT: Jumped to address ${cpu.registers.PC} (result was greater)`);
            } else {
                cpu.registers.PC++;
                log(`JGT: Skipped jump (result was not greater)`);
            }
            break;

        case instructions.JLE:
            if (cpu.registers.FLAGS & (FLAGS.NEGATIVE | FLAGS.ZERO)) {
                cpu.registers.PC = cpu.memory[cpu.registers.PC];
                log(`JLE: Jumped to address ${cpu.registers.PC} (result was less or equal)`);
            } else {
                cpu.registers.PC++;
                log(`JLE: Skipped jump (result was greater)`);
            }
            break;

        case instructions.JGE:
            if (!(cpu.registers.FLAGS & FLAGS.NEGATIVE)) {
                cpu.registers.PC = cpu.memory[cpu.registers.PC];
                log(`JGE: Jumped to address ${cpu.registers.PC} (result was greater or equal)`);
            } else {
                cpu.registers.PC++;
                log(`JGE: Skipped jump (result was less)`);
            }
            break;

        case instructions.JEQ:
            if (cpu.registers.FLAGS & FLAGS.ZERO) {
                cpu.registers.PC = cpu.memory[cpu.registers.PC];
                log(`JEQ: Jumped to address ${cpu.registers.PC} (result was equal)`);
            } else {
                cpu.registers.PC++;
                log(`JEQ: Skipped jump (result was not equal)`);
            }
            break;

        case instructions.JNE:
            if (!(cpu.registers.FLAGS & FLAGS.ZERO)) {
                cpu.registers.PC = cpu.memory[cpu.registers.PC];
                log(`JNE: Jumped to address ${cpu.registers.PC} (result was not equal)`);
            } else {
                cpu.registers.PC++;
                log(`JNE: Skipped jump (result was equal)`);
            }
            break;
            
        case instructions.HALT:
            log('HALT: Program execution stopped');
            addOutputLine('Program execution completed', 'success');
            pauseProgram();
            return false;
            
        default:
            log(`Unknown opcode: ${cpu.registers.IR}`, 'error');
            pauseProgram();
            return false;
    }
    
    updateRegisterValues();
    updateMemoryView();
    return true;
}

function updateFlags(result) {
    if (result === 0) cpu.registers.FLAGS |= FLAGS.ZERO;
    if (result & 0x80) cpu.registers.FLAGS |= FLAGS.NEGATIVE;
}

function runProgram() {
    if (!cpu.isRunning) {
        if (!elements.assemblyCode.value.trim()) {
            log('No code to run. Please enter some code or load a sample program.', 'error');
            addOutputLine('Error: No code to run', 'error');
            return;
        }
        
        if (!assembleProgram()) return;
        
        cpu.isRunning = true;
        updateButtonStates();
        addOutputLine('Program execution started', 'info');
        
        cpu.timer = setInterval(() => {
            if (!executeStep()) {
                clearInterval(cpu.timer);
                cpu.isRunning = false;
                updateButtonStates();
            }
        }, cpu.speed);
        
        log('Program execution started');
    }
}

function stepProgram() {
    if (!cpu.isRunning) {
        if (!assembleProgram()) return;
        executeStep();
    }
}

function pauseProgram() {
    if (cpu.isRunning) {
        clearInterval(cpu.timer);
        cpu.isRunning = false;
        updateButtonStates();
        log('Program execution paused');
    }
}

function resetProgram() {
    pauseProgram();
    cpu.registers = {
        ACC: 0,
        PC: 0,
        IR: 0,
        MAR: 0,
        MBR: 0,
        FLAGS: 0
    };
    cpu.memory.fill(0);
    updateRegisterValues();
    updateMemoryView();
    log('CPU state reset');
    addOutputLine('CPU state reset', 'info');
}

function highlightMemoryCell(address) {
    const cells = document.querySelectorAll('.memory-cell');
    cells.forEach(cell => cell.classList.remove('active'));
    if (cells[address]) {
        cells[address].classList.add('active');
        cells[address].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

document.addEventListener('DOMContentLoaded', initializeUI);



function initializeOutput() {
    const clearButton = document.querySelector('.clear-button');
    const outputContent = document.querySelector('.output-content');

    clearButton.addEventListener('click', () => {
        outputContent.innerHTML = '';
    });
}

function addOutputLine(content, type = 'info') {
    const outputContent = document.querySelector('.output-content');
    const line = document.createElement('div');
    line.className = `output-line ${type}`;

    const timestamp = document.createElement('span');
    timestamp.className = 'timestamp';
    timestamp.textContent = new Date().toLocaleTimeString();

    const contentSpan = document.createElement('span');
    contentSpan.className = 'content';
    contentSpan.textContent = content;

    line.appendChild(timestamp);
    line.appendChild(contentSpan);
    outputContent.appendChild(line);

    outputContent.scrollTop = outputContent.scrollHeight;
}


document.addEventListener('DOMContentLoaded', initializeOutput); 