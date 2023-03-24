import './App.css';

export const StateRename = () => {
    return (
        <div>
            <div className='stateRenameTitle'> Please enter new state name below</div>
            <div className='stateRenameInputWrapper'>
                <input type='text' />
                <input type='submit' />
            </div>
        </div>
    );
}